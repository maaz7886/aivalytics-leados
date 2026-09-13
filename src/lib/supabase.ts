// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Lead, Program, Stage } from '../types';

// Read Supabase Credentials from Environment or Local Storage
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  localStorage.getItem('VITE_SUPABASE_URL') ||
  'https://YOUR_SUPABASE_PROJECT.supabase.co';

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  localStorage.getItem('VITE_SUPABASE_ANON_KEY') ||
  'YOUR_ANON_PUBLIC_KEY';

export const isSupabaseConfigured =
  SUPABASE_URL !== 'https://YOUR_SUPABASE_PROJECT.supabase.co' &&
  SUPABASE_ANON_KEY !== 'YOUR_ANON_PUBLIC_KEY';

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

    return data.map((d: any) => ({
      id: d.id,
      fullName: d.full_name,
      phone: d.phone,
      email: d.email,
      city: d.city || 'Bengaluru',
      state: d.state || 'Karnataka',
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
      currentRole: d.current_role || 'Project Manager',
      currentCompany: d.current_company || 'Organization',
      industry: d.industry || 'Technology',
      yearsOfExperience: d.years_of_experience || 5,
      currentResponsibilities: d.current_responsibilities || '',
      currentSkillSet: Array.isArray(d.current_skill_set) ? d.current_skill_set : [],
      currentAiUsageLevel: d.current_ai_usage_level || 'Intermediate',
      primaryGoal: d.primary_goal || 'Upskill in Current Role',
      desiredRole: d.desired_role || '',
      expectedTimeline: d.expected_timeline || '3-6 months',
      mainChallenge: d.main_challenge || '',
      whyNow: d.why_now || '',
      expectedOutcome: d.expected_outcome || '',
      comments: d.comments || '',
      assignedSalesperson: d.assigned_salesperson || 'Alex Rivera',
      crmStage: (d.crm_stage || 'Lead') as Stage,
      leadTemperature: d.lead_temperature || 'Hot',
      lastContacted: d.last_contacted || 'Not Contacted',
      nextFollowUp: d.next_follow_up || '',
      numberOfCalls: d.number_of_calls || 0,
      numberOfFollowUps: d.number_of_follow_ups || 0,
      paymentStatus: d.payment_status || 'Unpaid',
      amountPaid: Number(d.amount_paid || 0),
      enrollmentStatus: d.enrollment_status || 'Not Enrolled',
      fitScore: d.fit_score || 85,
      intentScore: d.intent_score || 75,
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
      recommendedNextAction: '',
      callNotesHistory: Array.isArray(d.call_notes_history) ? d.call_notes_history : []
    }));
  } catch (err) {
    console.error('Supabase Exception:', err);
    return null;
  }
}

// 2. Insert New Lead into Supabase PostgreSQL
export async function insertLeadToSupabase(lead: Lead): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const dbPayload = {
      id: lead.id,
      full_name: lead.fullName,
      phone: lead.phone,
      email: lead.email,
      city: lead.city,
      state: lead.state,
      country: lead.country,
      source: lead.source,
      meta_campaign: lead.metaCampaign,
      meta_ad_set: lead.metaAdSet,
      meta_ad: lead.metaAd,
      campaign_id: lead.campaignId,
      program_id: lead.programId,
      program_name: lead.programName,
      professional_status: lead.professionalStatus,
      current_role: lead.currentRole,
      current_company: lead.currentCompany,
      industry: lead.industry,
      years_of_experience: lead.yearsOfExperience,
      current_ai_usage_level: lead.currentAiUsageLevel,
      primary_goal: lead.primaryGoal,
      desired_role: lead.desiredRole,
      expected_timeline: lead.expectedTimeline,
      main_challenge: lead.mainChallenge,
      assigned_salesperson: lead.assignedSalesperson,
      crm_stage: lead.crmStage,
      lead_temperature: lead.leadTemperature,
      fit_score: lead.fitScore,
      intent_score: lead.intentScore,
      call_notes_history: lead.callNotesHistory
    };

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
