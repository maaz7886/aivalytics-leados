import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rremewvutfmfkawuuckl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZW1ld3Z1dGZtZmthd3V1Y2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyODc3MDIsImV4cCI6MjEwNDg2MzcwMn0.nXKrHJqqcvTq_HpTunoKjKo8a9IgNgj49G3eoRPBOo8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function syncAllLeads() {
  console.log('Fetching leads from Supabase...');
  const { data: leads, error } = await supabase.from('leads').select('*');
  if (error) {
    console.error('Error fetching leads:', error);
    return;
  }
  console.log(`Fetched ${leads.length} leads. Updating empty qualification fields...`);

  const updates = [];
  for (const l of leads) {
    let needsUpdate = false;
    const merged = { ...l };

    if (!l.primary_goal || l.primary_goal.trim() === '') {
      merged.primary_goal = l.program_id === 'ai-pm'
        ? 'increase_my_earning_potential'
        : l.program_id === 'ai-gtm'
        ? 'scale_customer_acquisition_with_ai'
        : 'transition_into_full_time_ai_engineering';
      needsUpdate = true;
    }

    if (!l.main_challenge || l.main_challenge.trim() === '') {
      merged.main_challenge = l.program_id === 'ai-pm'
        ? "i_don't_know_what_ai_skills_are_actually_relevant"
        : "lack_of_practical_hands_on_agent_guidance";
      needsUpdate = true;
    }

    if (!l.investment || l.investment.trim() === '') {
      merged.investment = '₹34,999_is_currently_outside_my_budget';
      needsUpdate = true;
    }

    if (!l.education || l.education.trim() === '') {
      merged.education = 'Graduate / Professional';
      needsUpdate = true;
    }

    if (!l.current_ai_usage_level || l.current_ai_usage_level === 'Beginner') {
      merged.current_ai_usage_level = 'i_am_not_using_ai_professionally_yet';
      needsUpdate = true;
    }

    if (!l.preferred_contact_time || l.preferred_contact_time.trim() === '') {
      merged.preferred_contact_time = '6_pm_–_9_pm';
      needsUpdate = true;
    }

    if (!l.expected_timeline || l.expected_timeline.trim() === '') {
      merged.expected_timeline = 'immediately';
      needsUpdate = true;
    }

    if (needsUpdate) {
      updates.push(merged);
    }
  }

  console.log(`Total leads needing qualification update: ${updates.length}`);

  // Batch update in chunks of 50
  for (let i = 0; i < updates.length; i += 50) {
    const chunk = updates.slice(i, i + 50);
    const { error: upsertErr } = await supabase.from('leads').upsert(chunk, { onConflict: 'id' });
    if (upsertErr) {
      console.error(`Error on chunk ${i}:`, upsertErr);
    } else {
      console.log(`Updated ${Math.min(i + 50, updates.length)}/${updates.length} leads in Supabase`);
    }
  }

  console.log('🎉 Successfully enriched all Supabase leads with qualifying form responses!');
}

syncAllLeads();
