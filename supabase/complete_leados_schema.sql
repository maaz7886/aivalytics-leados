-- =========================================================================
-- AIValytics LeadOS - Complete Production Supabase Database Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- =========================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT DEFAULT '',
    city TEXT DEFAULT '',
    state TEXT DEFAULT '',
    country TEXT DEFAULT 'India',

    -- Acquisition & Tracking
    source TEXT DEFAULT 'Meta Lead Ads',
    meta_campaign TEXT DEFAULT '',
    meta_ad_set TEXT DEFAULT '',
    meta_ad TEXT DEFAULT '',
    campaign_id TEXT DEFAULT '',
    meta_lead_id TEXT,
    form_name TEXT DEFAULT '',
    form_answers JSONB DEFAULT '{}'::jsonb,
    date_captured TIMESTAMPTZ DEFAULT NOW(),
    assigned_at TIMESTAMPTZ,
    first_call_at TIMESTAMPTZ,
    time_to_first_call_seconds INT,

    -- Academic Program
    program_id TEXT DEFAULT 'ai-pm',
    program_name TEXT DEFAULT 'AI-Native Project Management',

    -- Professional Profile
    professional_status TEXT DEFAULT 'Working Professional',
    current_role TEXT DEFAULT '',
    current_company TEXT DEFAULT '',
    industry TEXT DEFAULT '',
    years_of_experience INT DEFAULT 0,
    current_responsibilities TEXT DEFAULT '',
    current_skill_set JSONB DEFAULT '[]'::jsonb,
    current_ai_usage_level TEXT DEFAULT 'Beginner',
    primary_goal TEXT DEFAULT '',
    desired_role TEXT DEFAULT '',
    expected_timeline TEXT DEFAULT '',
    main_challenge TEXT DEFAULT '',
    why_now TEXT DEFAULT '',
    expected_outcome TEXT DEFAULT '',
    comments TEXT DEFAULT '',
    investment TEXT DEFAULT '',
    education TEXT DEFAULT '',

    -- Sales Assignment & Workflow
    priority TEXT DEFAULT 'P2',
    qualification_status TEXT DEFAULT 'Unqualified',
    objection TEXT DEFAULT '',
    preferred_batch TEXT DEFAULT '',
    preferred_contact_time TEXT DEFAULT '',
    payment_link TEXT DEFAULT '',
    ai_recommendation TEXT DEFAULT '',
    assigned_salesperson TEXT DEFAULT 'Yameen',
    crm_stage TEXT DEFAULT 'New Lead',
    lead_temperature TEXT DEFAULT 'Cold',
    last_contacted TEXT DEFAULT 'Not Contacted',
    next_follow_up TEXT DEFAULT '',
    number_of_calls INT DEFAULT 0,
    number_of_follow_ups INT DEFAULT 0,
    payment_status TEXT DEFAULT 'Unpaid',
    amount_paid NUMERIC(10,2) DEFAULT 0,
    enrollment_status TEXT DEFAULT 'Not Enrolled',

    -- AI Scoring & Evaluation
    fit_score INT DEFAULT 75,
    intent_score INT DEFAULT 75,
    lead_score INT DEFAULT 50,
    lead_health_score INT DEFAULT 50,
    ai_summary TEXT DEFAULT '',
    next_best_action TEXT DEFAULT '',
    conversion_probability INT DEFAULT 50,
    temperature TEXT DEFAULT 'Cold',
    fit_score_breakdown JSONB DEFAULT '[]'::jsonb,
    intent_score_breakdown JSONB DEFAULT '[]'::jsonb,
    likely_desired_outcome TEXT DEFAULT '',
    recommended_positioning TEXT DEFAULT '',
    recommended_opening TEXT DEFAULT '',
    discovery_questions JSONB DEFAULT '[]'::jsonb,
    call_notes_history JSONB DEFAULT '[]'::jsonb,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    lead_id TEXT REFERENCES public.leads(id) ON DELETE CASCADE,
    assigned_to TEXT DEFAULT 'Yameen',
    due_date TIMESTAMPTZ,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'normal',
    task_type TEXT DEFAULT 'call',
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Programs Table
CREATE TABLE IF NOT EXISTS public.programs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    duration TEXT DEFAULT '',
    fee INT DEFAULT 0,
    seats INT DEFAULT 50,
    enrolled INT DEFAULT 0,
    next_batch_date TEXT DEFAULT '',
    description TEXT DEFAULT '',
    target_audience TEXT DEFAULT '',
    prerequisites TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Sync Logs Table
CREATE TABLE IF NOT EXISTS public.sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source TEXT NOT NULL,
    status TEXT NOT NULL,
    rows_processed INT DEFAULT 0,
    details TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enable Row Level Security (RLS) & Grant Access
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- Allow anon and authenticated users full CRUD access for app operation
CREATE POLICY "Allow anon all on leads" ON public.leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on programs" ON public.programs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on sync_logs" ON public.sync_logs FOR ALL USING (true) WITH CHECK (true);

-- 7. Realtime Replication: Broadcast changes immediately to all connected browsers
ALTER TABLE public.leads REPLICA IDENTITY FULL;
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER TABLE public.programs REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'leads'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'tasks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'programs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.programs;
  END IF;
END $$;

-- 8. Indexes for high-speed queries
CREATE INDEX IF NOT EXISTS idx_leads_assigned_salesperson ON public.leads (assigned_salesperson);
CREATE INDEX IF NOT EXISTS idx_leads_crm_stage ON public.leads (crm_stage);
CREATE INDEX IF NOT EXISTS idx_leads_date_captured ON public.leads (date_captured DESC);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads (phone);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads (email);
