// @ts-nocheck
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Lead, Program, Stage, Task } from '../types';

// Read Supabase Credentials from Environment or Local Storage with explicit live production fallbacks
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  localStorage.getItem('VITE_SUPABASE_URL') ||
  'https://rremewvutfmfkawuuckl.supabase.co';

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  localStorage.getItem('VITE_SUPABASE_ANON_KEY') ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZW1ld3Z1dGZtZmthd3V1Y2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyODc3MDIsImV4cCI6MjEwNDg2MzcwMn0.nXKrHJqqcvTq_HpTunoKjKo8a9IgNgj49G3eoRPBOo8';

export const isSupabaseConfigured = true;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper to check user auth
export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

// -------------------------------------------------------------
// SUPABASE REAL-TIME DATABASE SYNC FUNCTIONS
// -------------------------------------------------------------

// Helper to map Lead object to database row
export function mapLeadToDb(lead: Partial<Lead>): any {
  return {
    id: lead.id,
    full_name: lead.fullName || 'Unknown',
    phone: String(lead.phone || ''),
    email: lead.email || '',
    city: lead.city || '',
    state: lead.state || '',
    country: lead.country || 'India',
    source: lead.source || 'Meta Lead Ads',
    meta_campaign: lead.metaCampaign || '',
    meta_ad_set: lead.metaAdSet || '',
    meta_ad: lead.metaAd || '',
    campaign_id: lead.campaignId || '',
    date_captured: lead.dateCaptured || new Date().toISOString(),
    program_id: lead.programId || 'ai-pm',
    program_name: lead.programName || 'AI-Native Project Management',
    professional_status: lead.professionalStatus || 'Working Professional',
    current_role: lead.currentRole || '',
    current_company: lead.currentCompany || '',
    industry: lead.industry || '',
    years_of_experience: Number(lead.yearsOfExperience || 0),
    current_responsibilities: lead.currentResponsibilities || '',
    current_skill_set: Array.isArray(lead.currentSkillSet) ? lead.currentSkillSet : [],
    current_ai_usage_level: lead.currentAiUsageLevel || 'Beginner',
    primary_goal: lead.primaryGoal || '',
    desired_role: lead.desiredRole || '',
    expected_timeline: lead.expectedTimeline || '',
    main_challenge: lead.mainChallenge || '',
    why_now: lead.whyNow || '',
    expected_outcome: lead.expectedOutcome || '',
    comments: lead.comments || '',
    investment: lead.investment || '',
    education: lead.education || '',
    priority: lead.priority || 'P2',
    qualification_status: lead.qualificationStatus || 'Unqualified',
    objection: lead.objection || '',
    preferred_batch: lead.preferredBatch || '',
    preferred_contact_time: lead.preferredContactTime || '',
    payment_link: lead.paymentLink || '',
    ai_recommendation: lead.aiRecommendation || '',
    assigned_salesperson: lead.assignedSalesperson || 'Alex Rivera',
    crm_stage: lead.crmStage || 'New Lead',
    lead_temperature: lead.leadTemperature || 'Cold',
    last_contacted: lead.lastContacted || 'Not Contacted',
    next_follow_up: lead.nextFollowUp || '',
    number_of_calls: Number(lead.numberOfCalls || 0),
    number_of_follow_ups: Number(lead.numberOfFollowUps || 0),
    payment_status: lead.paymentStatus || 'Unpaid',
    amount_paid: Number(lead.amountPaid || 0),
    enrollment_status: lead.enrollmentStatus || 'Not Enrolled',
    fit_score: Number(lead.fitScore || 75),
    intent_score: Number(lead.intentScore || 75),
    lead_score: Number(lead.leadScore || 50),
    lead_health_score: Number(lead.leadHealthScore || 50),
    ai_summary: lead.aiSummary || '',
    next_best_action: lead.nextBestAction || '',
    conversion_probability: Number(lead.conversionProbability || 50),
    temperature: lead.temperature || 'Cold',
    fit_score_breakdown: Array.isArray(lead.fitScoreBreakdown) ? lead.fitScoreBreakdown : [],
    intent_score_breakdown: Array.isArray(lead.intentScoreBreakdown) ? lead.intentScoreBreakdown : [],
    likely_desired_outcome: lead.likelyDesiredOutcome || '',
    recommended_positioning: lead.recommendedPositioning || '',
    recommended_opening: lead.recommendedOpening || '',
    discovery_questions: Array.isArray(lead.discoveryQuestions) ? lead.discoveryQuestions : [],
    call_notes_history: Array.isArray(lead.callNotesHistory) ? lead.callNotesHistory : []
  };
}

// Helper to map database row to Lead object
export function mapDbToLead(d: any): Lead {
  return {
    id: d.id,
    fullName: d.full_name,
    phone: d.phone,
    email: d.email,
    city: d.city || '',
    state: d.state || '',
    country: d.country || 'India',
    source: d.source || 'Meta Lead Ads',
    metaCampaign: d.meta_campaign || '',
    metaAdSet: d.meta_ad_set || '',
    metaAd: d.meta_ad || '',
    campaignId: d.campaign_id || '',
    dateCaptured: d.date_captured || d.created_at,
    programId: d.program_id || 'ai-pm',
    programName: d.program_name || 'AI-Native Project Management',
    professionalStatus: d.professional_status || 'Working Professional',
    currentRole: d.current_role || '',
    currentCompany: d.current_company || '',
    industry: d.industry || '',
    yearsOfExperience: Number(d.years_of_experience || 0),
    currentResponsibilities: d.current_responsibilities || '',
    currentSkillSet: Array.isArray(d.current_skill_set) ? d.current_skill_set : [],
    currentAiUsageLevel: d.current_ai_usage_level || 'Beginner',
    primaryGoal: d.primary_goal || '',
    desiredRole: d.desired_role || '',
    expectedTimeline: d.expected_timeline || '',
    mainChallenge: d.main_challenge || '',
    whyNow: d.why_now || '',
    expectedOutcome: d.expected_outcome || '',
    comments: d.comments || '',
    investment: d.investment || '',
    education: d.education || '',
    priority: d.priority || 'P2',
    qualificationStatus: d.qualification_status || 'Unqualified',
    objection: d.objection || '',
    preferredBatch: d.preferred_batch || '',
    preferredContactTime: d.preferred_contact_time || '',
    paymentLink: d.payment_link || '',
    aiRecommendation: d.ai_recommendation || '',
    assignedSalesperson: d.assigned_salesperson || 'Alex Rivera',
    crmStage: (d.crm_stage || 'New Lead') as Stage,
    leadTemperature: d.lead_temperature || 'Cold',
    lastContacted: d.last_contacted || 'Not Contacted',
    nextFollowUp: d.next_follow_up || '',
    numberOfCalls: Number(d.number_of_calls || 0),
    numberOfFollowUps: Number(d.number_of_follow_ups || 0),
    paymentStatus: d.payment_status || 'Unpaid',
    amountPaid: Number(d.amount_paid || 0),
    enrollmentStatus: d.enrollment_status || 'Not Enrolled',
    fitScore: Number(d.fit_score || 75),
    intentScore: Number(d.intent_score || 75),
    leadScore: Number(d.lead_score || 50),
    leadHealthScore: Number(d.lead_health_score || 50),
    aiSummary: d.ai_summary || '',
    nextBestAction: d.next_best_action || '',
    conversionProbability: Number(d.conversion_probability || 50),
    temperature: d.temperature || 'Cold',
    fitScoreBreakdown: Array.isArray(d.fit_score_breakdown) ? d.fit_score_breakdown : [],
    intentScoreBreakdown: Array.isArray(d.intent_score_breakdown) ? d.intent_score_breakdown : [],
    likelyDesiredOutcome: d.likely_desired_outcome || '',
    evidenceLeadProvided: [],
    evidenceAiInterpretation: [],
    recommendedPositioning: d.recommended_positioning || '',
    recommendedOpening: d.recommended_opening || '',
    discoveryQuestions: Array.isArray(d.discovery_questions) ? d.discovery_questions : [],
    existingSkills: [],
    aiSkillsToDevelop: [],
    whyProgramFits: '',
    objections: [],
    recommendedNextAction: d.next_best_action || '',
    callNotesHistory: Array.isArray(d.call_notes_history) ? d.call_notes_history : []
  };
}

// 1. Fetch All Leads from Supabase PostgreSQL
export async function fetchLeadsFromSupabase(): Promise<Lead[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch error:', error);
      return null;
    }

    if (!data) return null;

    return data.map(mapDbToLead);
  } catch (err) {
    console.error('Supabase Exception:', err);
    return null;
  }
}

// 2. Insert or Upsert Single Lead into Supabase PostgreSQL
export async function insertLeadToSupabase(lead: Lead): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const dbPayload = mapLeadToDb(lead);
    const { error } = await supabase.from('leads').upsert([dbPayload]);
    if (error) {
      console.warn('Supabase Lead Insert Error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase Exception on Insert:', err);
    return false;
  }
}

// 2b. Bulk Insert or Upsert Leads into Supabase in Batches
export async function insertBulkLeadsToSupabase(leads: Lead[]): Promise<boolean> {
  if (!isSupabaseConfigured || !leads || leads.length === 0) return true;
  try {
    const BATCH_SIZE = 50;
    const mapped = leads.map(mapLeadToDb);
    for (let i = 0; i < mapped.length; i += BATCH_SIZE) {
      const chunk = mapped.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from('leads').upsert(chunk);
      if (error) {
        console.warn('Supabase Bulk Insert Chunk Error:', error);
        return false;
      }
    }
    return true;
  } catch (err) {
    console.error('Supabase Exception on Bulk Insert:', err);
    return false;
  }
}

// 3. Update Lead CRM Stage in Supabase
export async function updateLeadStageInSupabase(id: string, stage: Stage): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase
      .from('leads')
      .update({ crm_stage: stage, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.warn('Supabase Update Stage Error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase Exception on Update Stage:', err);
    return false;
  }
}

// 3b. Delete Lead from Supabase
export async function deleteLeadFromSupabase(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) {
      console.warn('Supabase Delete Lead Error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase Exception on Delete Lead:', err);
    return false;
  }
}

// 3c. Bulk Delete Leads from Supabase
export async function deleteBulkLeadsFromSupabase(ids: string[]): Promise<boolean> {
  if (!isSupabaseConfigured || ids.length === 0) return false;
  try {
    const { error } = await supabase.from('leads').delete().in('id', ids);
    if (error) {
      console.warn('Supabase Bulk Delete Error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase Exception on Bulk Delete:', err);
    return false;
  }
}

// 4. Fetch Programs Catalog from Supabase
export async function fetchProgramsFromSupabase(): Promise<Program[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase.from('programs').select('*');
    if (error || !data) return null;

    return data.map((p: any) => ({
      id: p.id,
      name: p.name,
      duration: p.duration,
      price: Number(p.price),
      structure: Array.isArray(p.structure) ? p.structure : [],
      eligibility: p.eligibility || '',
      placementSupport: p.placement_support || '',
      outcomes: Array.isArray(p.outcomes) ? p.outcomes : [],
      projects: Array.isArray(p.projects) ? p.projects : [],
      batchTiming: p.batch_timing || '',
      faqs: Array.isArray(p.faqs) ? p.faqs : []
    }));
  } catch (err) {
    console.error('Supabase Fetch Programs Error:', err);
    return null;
  }
}

// 5. Upsert Program in Supabase
export async function upsertProgramInSupabase(program: Program): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('programs').upsert({
      id: program.id,
      name: program.name,
      duration: program.duration,
      price: program.price,
      structure: program.structure,
      eligibility: program.eligibility,
      placement_support: program.placementSupport,
      outcomes: program.outcomes,
      projects: program.projects,
      batch_timing: program.batchTiming,
      faqs: program.faqs
    });

    if (error) {
      console.warn('Supabase Upsert Program Error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase Exception on Upsert Program:', err);
    return false;
  }
}

// 6. Fetch Tasks from Supabase
export async function fetchTasksFromSupabase(): Promise<Task[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (error || !data) return null;

    return data.map((t: any) => ({
      id: t.id,
      leadId: t.lead_id || '',
      leadName: t.lead_name || 'Lead Task',
      title: t.description || `${t.type || 'Call'} task for ${t.lead_name || 'lead'}`,
      type: t.type || 'call',
      dueDate: t.due_date || 'Today',
      priority: t.priority || 'Medium',
      status: t.status || 'Pending',
      description: t.description || '',
      assignedTo: t.assigned_to || 'Alex Rivera'
    }));
  } catch (err) {
    console.error('Supabase Fetch Tasks Error:', err);
    return null;
  }
}

// 7. Upsert Task in Supabase
export async function upsertTaskInSupabase(task: Task): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const payload = {
      id: task.id,
      lead_id: task.leadId || null,
      lead_name: task.leadName || '',
      type: (task.type || 'call').toLowerCase(),
      due_date: task.dueDate && task.dueDate.includes('-') ? task.dueDate.substring(0, 10) : new Date().toISOString().substring(0, 10),
      priority: task.priority || 'Medium',
      status: task.status || 'Pending',
      description: task.description || task.title || '',
      assigned_to: task.assignedTo || 'Alex Rivera'
    };

    let { error } = await supabase.from('tasks').upsert(payload);
    if (error && error.code === '23503') {
      const retry = await supabase.from('tasks').upsert({ ...payload, lead_id: null });
      error = retry.error;
    }

    if (error) {
      console.warn('Supabase Upsert Task Error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase Exception on Upsert Task:', err);
    return false;
  }
}

// 8. Delete Task from Supabase
export async function deleteTaskFromSupabase(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) {
      console.warn('Supabase Delete Task Error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase Exception on Delete Task:', err);
    return false;
  }
}

