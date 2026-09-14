-- ==========================================
-- Aivalytics LeadOS CRM: Supabase Schema DDL
-- Execute this SQL script in Supabase SQL Editor
-- ==========================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    city TEXT DEFAULT 'Bengaluru',
    state TEXT DEFAULT 'Karnataka',
    country TEXT DEFAULT 'India',
    
    -- Acquisition & Meta Ads (7 Core Lead Form Questions)
    source TEXT DEFAULT 'Meta Lead Ads',
    meta_form_submission JSONB DEFAULT '{}'::jsonb,
    meta_campaign TEXT,
    meta_ad_set TEXT,
    meta_ad TEXT,
    campaign_id TEXT,
    date_captured TIMESTAMPTZ DEFAULT NOW(),
    
    -- Program
    program_id TEXT DEFAULT 'ai-pm',
    program_name TEXT DEFAULT 'AI-Native Project Management',
    
    -- Professional Profile
    professional_status TEXT DEFAULT 'Working Professional',
    "current_role" TEXT DEFAULT 'Project Manager',
    current_company TEXT DEFAULT 'Tech Organization',
    industry TEXT DEFAULT 'Technology',
    years_of_experience INT DEFAULT 5,
    current_responsibilities TEXT,
    current_skill_set JSONB DEFAULT '[]'::jsonb,
    current_ai_usage_level TEXT DEFAULT 'Intermediate',
    
    -- Career Goals
    primary_goal TEXT DEFAULT 'Upskill in Current Role',
    desired_role TEXT,
    expected_timeline TEXT DEFAULT '3-6 months',
    main_challenge TEXT,
    why_now TEXT,
    expected_outcome TEXT,
    comments TEXT,
    
    -- Sales & CRM Stages
    assigned_salesperson TEXT DEFAULT 'Alex Rivera',
    crm_stage TEXT DEFAULT 'Lead',
    lead_temperature TEXT DEFAULT 'Hot',
    last_contacted TEXT DEFAULT 'Not Contacted',
    next_follow_up TEXT,
    number_of_calls INT DEFAULT 0,
    number_of_follow_ups INT DEFAULT 0,
    payment_status TEXT DEFAULT 'Unpaid',
    amount_paid NUMERIC(10, 2) DEFAULT 0,
    enrollment_status TEXT DEFAULT 'Not Enrolled',
    
    -- AI Scoring & Analysis
    fit_score INT DEFAULT 85,
    intent_score INT DEFAULT 75,
    fit_score_breakdown JSONB DEFAULT '[]'::jsonb,
    intent_score_breakdown JSONB DEFAULT '[]'::jsonb,
    likely_desired_outcome TEXT,
    recommended_positioning TEXT,
    recommended_opening TEXT,
    discovery_questions JSONB DEFAULT '[]'::jsonb,
    
    -- Call Notes History
    call_notes_history JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Programs Table
CREATE TABLE IF NOT EXISTS public.programs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    duration TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    structure JSONB DEFAULT '[]'::jsonb,
    eligibility TEXT,
    placement_support TEXT,
    outcomes JSONB DEFAULT '[]'::jsonb,
    projects JSONB DEFAULT '[]'::jsonb,
    batch_timing TEXT,
    faqs JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    lead_id TEXT REFERENCES public.leads(id) ON DELETE CASCADE,
    lead_name TEXT,
    type TEXT NOT NULL,
    due_date TEXT NOT NULL,
    priority TEXT DEFAULT 'Medium',
    status TEXT DEFAULT 'Pending',
    description TEXT,
    assigned_to TEXT DEFAULT 'Alex Rivera',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Seed Initial Program Dataset
INSERT INTO public.programs (id, name, duration, price, eligibility, placement_support, batch_timing, outcomes, projects)
VALUES
(
    'ai-pm',
    'AI-Native Project Management',
    '3 Months',
    49999.00,
    '3+ years experience in PM, Operations, Tech, or Business Delivery',
    'Resume positioning for AI-PM roles, 1-on-1 career coaching, top company referrals',
    'Saturdays & Sundays (10:00 AM - 1:00 PM IST)',
    '["Build multi-agent workflow systems that automate 50% of routine PM tasks", "Engineer custom AI SOPs for engineering teams"]'::jsonb,
    '["Autonomous Sprint Status & Risk Auditor Agent", "AI-Powered PRD & User Story Generator Workflow"]'::jsonb
),
(
    'ai-gtm',
    'AI-Native GTM & Growth',
    '3 Months',
    54999.00,
    'Marketing Leads, Growth Managers, Founders, Product Marketers',
    'GTM Portfolio build, growth advisory network, career referral network',
    'Saturdays & Sundays (2:00 PM - 5:00 PM IST)',
    '["Scale qualified lead volume 3x while cutting manual research time by 70%"]'::jsonb,
    '["Autonomous Outbound Lead Enrichment & Prospecting Agent"]'::jsonb
),
(
    'ai-fellowship',
    'AI Leadership Fellowship',
    '4 Months',
    99999.00,
    'Founders, Directors, VP/CXOs, Management Consultants (10+ yrs exp)',
    'Executive network access, investor demo day, corporate transformation board referrals',
    'Alternate Weekends & Mastermind Dinners',
    '["Launch AI business unit or consulting offering with validated architecture"]'::jsonb,
    '["Full Enterprise AI Audit & Agent Deployment Architecture"]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    price = EXCLUDED.price,
    name = EXCLUDED.name;

-- 6. Seed Initial Demo Lead Dataset
INSERT INTO public.leads (
    id, full_name, phone, email, city, source, program_id, program_name,
    professional_status, current_role, current_company, years_of_experience,
    current_ai_usage_level, primary_goal, crm_stage, fit_score, intent_score
)
VALUES
(
    'lead-rahul-001',
    'Rahul Sharma',
    '+91 98765 43210',
    'rahul.sharma@techcorp.io',
    'Bengaluru',
    'Meta Lead Ads',
    'ai-pm',
    'AI-Native Project Management',
    'Working Professional',
    'Project Manager',
    'TechCorp Solutions',
    10,
    'Intermediate',
    'Upskill + Switch Company',
    'Qualified',
    92,
    68
),
(
    'lead-priya-002',
    'Priya Sundaram',
    '+91 91234 56789',
    'priya.s@gtmscale.com',
    'Mumbai',
    'Meta Lead Ads',
    'ai-gtm',
    'AI-Native GTM',
    'Working Professional',
    'Growth Marketing Lead',
    'GTM Scale Studio',
    7,
    'Intermediate',
    'Learn Automation',
    'Interested',
    88,
    74
),
(
    'lead-vikram-003',
    'Vikram Mehta',
    '+91 99887 76655',
    'vikram@mehtaconsulting.com',
    'Delhi NCR',
    'Meta Lead Ads',
    'ai-fellowship',
    'AI Fellowship',
    'Founder',
    'Managing Director',
    'Mehta Consulting Group',
    14,
    'Beginner',
    'Start a Business',
    'Details sent',
    96,
    91
)
ON CONFLICT (id) DO NOTHING;

-- 7. Enable Row Level Security (RLS) & Public Policies for App Integration
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on leads" ON public.leads FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on leads" ON public.leads FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on programs" ON public.programs FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on programs" ON public.programs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on programs" ON public.programs FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on tasks" ON public.tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on tasks" ON public.tasks FOR UPDATE USING (true);
