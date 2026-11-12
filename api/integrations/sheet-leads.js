// api/integrations/sheet-leads.js
// Vercel Serverless Function: High-Reliability Google Sheet → LeadOS Real-time Ingestion

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://rremewvutfmfkawuuckl.supabase.co';

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZW1ld3Z1dGZtZmthd3V1Y2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyODc3MDIsImV4cCI6MjEwNDg2MzcwMn0.nXKrHJqqcvTq_HpTunoKjKo8a9IgNgj49G3eoRPBOo8';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Default Secret Key (can be configured in Vercel as LEADOS_SYNC_API_KEY)
const EXPECTED_API_KEY = process.env.LEADOS_SYNC_API_KEY || 'aiv_sync_sec_9942a1bc';

function normalizeIndianPhone(raw) {
  if (!raw) return '';
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length === 10) return '+91' + digits;
  if (digits.length === 11 && digits.startsWith('0')) return '+91' + digits.slice(1);
  if (digits.length === 12 && digits.startsWith('91')) return '+' + digits;
  if (digits.length > 10) return '+' + digits;
  return digits ? '+' + digits : '';
}

function normalizeEmail(raw) {
  if (!raw) return '';
  return String(raw).trim().toLowerCase();
}

function resolveProgram(programInput) {
  const p = (programInput || '').toLowerCase();
  if (p.includes('builder') || p.includes('workshop') || p.includes('3-day') || p.includes('3 day')) {
    return {
      programId: 'workshop-3day',
      programName: '3-Day AI Builder Workshop'
    };
  }
  return {
    programId: 'ai-pm',
    programName: 'AI-Native Product Management (4 Certifications in 3 Months)'
  };
}

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Health-check / Status GET
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'active',
      service: 'LeadOS Google Sheet Real-time Ingestion API',
      timestamp: new Date().toISOString()
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. API Key Authentication Check
  const providedKey = req.headers['x-api-key'] || req.query.apiKey;
  if (!providedKey || providedKey !== EXPECTED_API_KEY) {
    console.warn('[Sync API]: Unauthorized access attempt with key:', providedKey);
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing x-api-key header' });
  }

  try {
    const body = req.body || {};
    const rawLeads = Array.isArray(body) ? body : Array.isArray(body.leads) ? body.leads : [body];

    if (rawLeads.length === 0 || !rawLeads[0] || Object.keys(rawLeads[0]).length === 0) {
      return res.status(400).json({ error: 'No lead rows provided in request body' });
    }

    // 2. Fetch Active Sales Reps for Capacity-Aware Auto-Assignment
    let activeReps = [];
    try {
      const { data: dbProfiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'Salesperson')
        .eq('status', 'Active');

      if (dbProfiles && dbProfiles.length > 0) {
        activeReps = dbProfiles.map((p) => ({
          name: p.full_name || p.name,
          email: p.email,
          capacity: p.daily_lead_capacity || 30
        }));
      }
    } catch {}

    if (activeReps.length === 0) {
      activeReps = [
        { name: 'Alex Rivera', email: 'alex.rivera@aivalytics.io', capacity: 30 },
        { name: 'Sarah Chen', email: 'sarah.chen@aivalytics.io', capacity: 25 },
        { name: 'Marcus Vance', email: 'marcus.vance@aivalytics.io', capacity: 25 },
        { name: 'Priya Sharma', email: 'priya.sharma@aivalytics.io', capacity: 30 },
        { name: 'David Kim', email: 'david.kim@aivalytics.io', capacity: 20 }
      ];
    }

    // Fetch today's count per rep to respect daily capacity
    const todayIso = new Date().toISOString().substring(0, 10);
    const repTodayCounts = {};
    activeReps.forEach((r) => (repTodayCounts[r.name] = 0));

    try {
      const { data: todayLeads } = await supabase
        .from('leads')
        .select('assigned_salesperson')
        .gte('created_at', `${todayIso}T00:00:00.000Z`);

      (todayLeads || []).forEach((l) => {
        if (l.assigned_salesperson && repTodayCounts[l.assigned_salesperson] !== undefined) {
          repTodayCounts[l.assigned_salesperson]++;
        }
      });
    } catch {}

    let roundRobinIdx = 0;
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // 3. Process Each Row
    for (const row of rawLeads) {
      const rowId = row.rowId || row.rowIndex || row.id || row.meta_lead_id || row.lead_id;
      try {
        const fullName = (row.fullName || row.name || row.full_name || row['Full Name'] || 'Applicant').trim();
        const rawPhone = row.phone || row.phoneNumber || row.phone_number || row['Phone'] || row['Phone Number'] || '';
        const rawEmail = row.email || row['Email'] || row['Email Address'] || '';
        const phone = normalizeIndianPhone(rawPhone);
        const email = normalizeEmail(rawEmail);

        if (!phone && !email) {
          throw new Error('Both phone and email are missing. Cannot ingest lead without contact info.');
        }

        const metaLeadId = String(row.metaLeadId || row.meta_lead_id || row['Lead ID'] || row['Meta Lead ID'] || '').trim();
        const campaignName = row.campaignName || row.metaCampaign || row.meta_campaign || row['Campaign Name'] || 'Meta Lead Ads';
        const adSetName = row.adSetName || row.metaAdSet || row.meta_ad_set || row['Ad Set Name'] || '';
        const adName = row.adName || row.metaAd || row.meta_ad || row['Ad Name'] || '';
        const formName = row.formName || row.form_name || row['Form Name'] || '';
        const city = row.city || row['City'] || 'Bengaluru';
        const state = row.state || row['State'] || '';
        const progInfo = resolveProgram(row.programName || row.program || row['Program Interested'] || row['Target Program']);

        // Collect extra custom answers as JSON
        const standardKeys = new Set([
          'fullname', 'name', 'full_name', 'phone', 'phonenumber', 'phone_number',
          'email', 'city', 'state', 'country', 'program', 'programname', 'targetprogram',
          'campaign', 'campaignname', 'adset', 'adsetname', 'ad', 'adname', 'formname',
          'leadid', 'metaleadid', 'rowid', 'rowindex', 'date', 'createdtime', 'timestamp'
        ]);

        const formAnswers = {};
        Object.entries(row).forEach(([k, v]) => {
          const cleanK = k.toLowerCase().replace(/[\s_\-]/g, '');
          if (!standardKeys.has(cleanK) && v !== undefined && v !== null && v !== '') {
            formAnswers[k] = v;
          }
        });

        // 4. DEDUPLICATION CHECK
        let existingLead = null;

        // A. Match on Meta Lead ID if available
        if (metaLeadId) {
          const { data: byMetaId } = await supabase
            .from('leads')
            .select('*')
            .eq('meta_lead_id', metaLeadId)
            .limit(1)
            .maybeSingle();
          if (byMetaId) existingLead = byMetaId;
        }

        // B. Match on Phone if not found
        if (!existingLead && phone) {
          const { data: byPhone } = await supabase
            .from('leads')
            .select('*')
            .eq('phone', phone)
            .limit(1)
            .maybeSingle();
          if (byPhone) existingLead = byPhone;
        }

        // C. Match on Email if not found
        if (!existingLead && email) {
          const { data: byEmail } = await supabase
            .from('leads')
            .select('*')
            .eq('email', email)
            .limit(1)
            .maybeSingle();
          if (byEmail) existingLead = byEmail;
        }

        const nowIso = new Date().toISOString();

        if (existingLead) {
          // Merge / Update without creating a duplicate record
          const mergedAnswers = {
            ...(existingLead.form_answers || {}),
            ...formAnswers
          };

          const updatePayload = {
            form_answers: mergedAnswers,
            meta_campaign: existingLead.meta_campaign || campaignName,
            meta_ad_set: existingLead.meta_ad_set || adSetName,
            meta_ad: existingLead.meta_ad || adName,
            form_name: existingLead.form_name || formName,
            updated_at: nowIso
          };

          if (metaLeadId && !existingLead.meta_lead_id) {
            updatePayload.meta_lead_id = metaLeadId;
          }

          await supabase.from('leads').update(updatePayload).eq('id', existingLead.id);

          // Write timeline event for update
          await supabase.from('lead_timeline').insert({
            id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            lead_id: existingLead.id,
            event_type: 'synced_from_sheet',
            performed_by: 'System',
            performed_by_name: 'Google Sheet Sync',
            details: { action: 'duplicate_merged', source: 'Google Sheet', metaLeadId, campaign: campaignName }
          }).catch(() => {});

          results.push({
            rowId,
            status: 'Synced',
            leadId: existingLead.id,
            action: 'merged_duplicate',
            assignedTo: existingLead.assigned_salesperson
          });
          successCount++;
          continue;
        }

        // 5. AUTO-ASSIGN LOGIC (Respecting Daily Capacity)
        // Find an active rep who has not exceeded today's capacity
        let assignedRep = null;
        for (let i = 0; i < activeReps.length; i++) {
          const rep = activeReps[(roundRobinIdx + i) % activeReps.length];
          const currentCount = repTodayCounts[rep.name] || 0;
          if (currentCount < rep.capacity) {
            assignedRep = rep.name;
            repTodayCounts[rep.name] = currentCount + 1;
            roundRobinIdx = (roundRobinIdx + i + 1) % activeReps.length;
            break;
          }
        }

        // Fallback to first active rep if all are at capacity
        if (!assignedRep) {
          assignedRep = activeReps[0]?.name || 'Alex Rivera';
        }

        const newLeadId = `lead-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

        const insertPayload = {
          id: newLeadId,
          full_name: fullName,
          phone,
          email,
          city,
          state,
          country: 'India',
          source: 'Meta Ads',
          meta_campaign: campaignName,
          meta_ad_set: adSetName,
          meta_ad: adName,
          form_name: formName,
          meta_lead_id: metaLeadId || null,
          program_id: progInfo.programId,
          program_name: progInfo.programName,
          professional_status: row.professionalStatus || 'Working Professional',
          current_role: row.currentRole || row.role || 'Professional',
          current_company: row.currentCompany || row.company || '',
          years_of_experience: Number(row.yearsOfExperience || row.experience || 3),
          primary_goal: row.primaryGoal || 'Transition into AI Role',
          form_answers: formAnswers,
          assigned_salesperson: assignedRep,
          assigned_at: nowIso,
          crm_stage: 'New Lead',
          lead_temperature: 'Hot',
          last_contacted: 'Not Contacted',
          fit_score: 85,
          intent_score: 85,
          date_captured: nowIso,
          created_at: nowIso,
          updated_at: nowIso
        };

        const { error: insertErr } = await supabase.from('leads').insert(insertPayload);
        if (insertErr) throw insertErr;

        // 6. Write Timeline Audit Entries
        await supabase.from('lead_timeline').insert([
          {
            id: `evt-sync-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            lead_id: newLeadId,
            event_type: 'synced_from_sheet',
            performed_by: 'System',
            performed_by_name: 'Google Sheet Sync',
            details: {
              source: 'Meta Ads Google Sheet',
              metaLeadId,
              campaign: campaignName,
              adSet: adSetName,
              ad: adName,
              form: formName
            },
            created_at: nowIso
          },
          {
            id: `evt-assign-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            lead_id: newLeadId,
            event_type: 'assigned',
            performed_by: 'System',
            performed_by_name: 'Auto-Assign Engine',
            details: {
              assignedTo: assignedRep,
              method: 'Round-Robin Capacity Allocation',
              todayCount: repTodayCounts[assignedRep]
            },
            created_at: nowIso
          }
        ]).catch(() => {});

        results.push({
          rowId,
          status: 'Synced',
          leadId: newLeadId,
          action: 'created_and_assigned',
          assignedTo: assignedRep
        });
        successCount++;
      } catch (rowErr) {
        console.error(`[Sync API Error on Row ${rowId}]:`, rowErr.message);
        results.push({
          rowId,
          status: 'Error',
          error: rowErr.message || 'Failed to process lead row'
        });
        errorCount++;
      }
    }

    // 7. Write to Integration Sync Logs
    await supabase.from('integration_sync_logs').insert({
      id: `synclog-${Date.now()}`,
      source: 'Google Sheet',
      leads_count: rawLeads.length,
      success_count: successCount,
      error_count: errorCount,
      errors: results.filter((r) => r.status === 'Error'),
      created_at: new Date().toISOString()
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      processed: rawLeads.length,
      successCount,
      errorCount,
      results
    });
  } catch (globalErr) {
    console.error('[Sync API Global Exception]:', globalErr);
    return res.status(500).json({ error: globalErr.message || 'Internal Server Error' });
  }
}
