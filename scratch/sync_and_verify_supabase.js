import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rremewvutfmfkawuuckl.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZW1ld3Z1dGZtZmthd3V1Y2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyODc3MDIsImV4cCI6MjEwNDg2MzcwMn0.nXKrHJqqcvTq_HpTunoKjKo8a9IgNgj49G3eoRPBOo8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkSync() {
  console.log('🔍 Checking Supabase Database Sync Status...');

  // 1. Check total count
  const { data: leads, error, count } = await supabase
    .from('leads')
    .select('id, full_name, phone, email, assigned_salesperson, crm_stage, program_name', { count: 'exact' });

  if (error) {
    console.error('❌ Supabase Query Error:', error);
    return;
  }

  console.log(`✅ Total leads in Supabase: ${count}`);

  // 2. Count leads by salesperson
  const repCounts = {};
  leads.forEach((l) => {
    const rep = l.assigned_salesperson || 'Unassigned';
    repCounts[rep] = (repCounts[rep] || 0) + 1;
  });

  console.log('\n📊 Leads by Salesperson in Supabase:');
  for (const [rep, c] of Object.entries(repCounts)) {
    console.log(`  - ${rep}: ${c} leads`);
  }

  // 3. Count leads by stage
  const stageCounts = {};
  leads.forEach((l) => {
    const st = l.crm_stage || 'Unknown';
    stageCounts[st] = (stageCounts[st] || 0) + 1;
  });

  console.log('\n🎯 Leads by Stage in Supabase:');
  for (const [st, c] of Object.entries(stageCounts)) {
    console.log(`  - ${st}: ${c} leads`);
  }

  // 4. Check if any leads have Details Sent on WhatsApp
  const detailsSent = leads.filter((l) => l.crm_stage === 'Details Sent on WhatsApp');
  console.log(`\n📲 "Details Sent on WhatsApp" leads in Supabase: ${detailsSent.length}`);

  // 5. Check Abhishek Raneja
  const abhishek = leads.find((l) => (l.full_name || '').includes('Abhishek Raneja') || (l.phone || '').includes('8857041481'));
  if (abhishek) {
    console.log('\n👤 Abhishek Raneja lead record:');
    console.log(abhishek);
  } else {
    console.log('\n⚠️ Abhishek Raneja not found in sample query.');
  }
}

checkSync();
