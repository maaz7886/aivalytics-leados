-- ==========================================
-- PHASE 1: NORMALIZED SUPPORTING TABLES
-- ==========================================

-- Users / Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'Salesperson', -- Admin, Manager, Salesperson
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Import Batches
CREATE TABLE IF NOT EXISTS public.import_batches (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    source TEXT,
    uploaded_by UUID REFERENCES public.profiles(id),
    total_rows INT DEFAULT 0,
    imported_rows INT DEFAULT 0,
    updated_rows INT DEFAULT 0,
    duplicates INT DEFAULT 0,
    failed_rows INT DEFAULT 0,
    skipped_rows INT DEFAULT 0,
    errors JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;

-- Lead Activities (Universal Timeline)
CREATE TABLE IF NOT EXISTS public.lead_activities (
    id TEXT PRIMARY KEY,
    lead_id TEXT REFERENCES public.leads(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'stage_change', 'call', 'whatsapp', 'note', 'ai_eval', 'payment'
    description TEXT,
    created_by UUID REFERENCES public.profiles(id),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;

-- Lead Stage History
CREATE TABLE IF NOT EXISTS public.lead_stage_history (
    id TEXT PRIMARY KEY,
    lead_id TEXT REFERENCES public.leads(id) ON DELETE CASCADE,
    previous_stage TEXT,
    new_stage TEXT NOT NULL,
    reason TEXT,
    changed_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.lead_stage_history ENABLE ROW LEVEL SECURITY;

-- Calls
CREATE TABLE IF NOT EXISTS public.calls (
    id TEXT PRIMARY KEY,
    lead_id TEXT REFERENCES public.leads(id) ON DELETE CASCADE,
    outcome TEXT NOT NULL,
    duration_seconds INT,
    recording_url TEXT,
    salesperson_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;

-- Notes
CREATE TABLE IF NOT EXISTS public.notes (
    id TEXT PRIMARY KEY,
    lead_id TEXT REFERENCES public.leads(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Follow Ups
CREATE TABLE IF NOT EXISTS public.follow_ups (
    id TEXT PRIMARY KEY,
    lead_id TEXT REFERENCES public.leads(id) ON DELETE CASCADE,
    scheduled_date TIMESTAMPTZ NOT NULL,
    completed_date TIMESTAMPTZ,
    status TEXT DEFAULT 'Pending', -- 'Pending', 'Completed', 'Cancelled'
    assigned_to UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;

-- Objections Master List
CREATE TABLE IF NOT EXISTS public.objections (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    default_handling_script TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.objections ENABLE ROW LEVEL SECURITY;

-- Lead Objections (Junction)
CREATE TABLE IF NOT EXISTS public.lead_objections (
    id TEXT PRIMARY KEY,
    lead_id TEXT REFERENCES public.leads(id) ON DELETE CASCADE,
    objection_id TEXT REFERENCES public.objections(id),
    objection_text TEXT,
    handled BOOLEAN DEFAULT FALSE,
    logged_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.lead_objections ENABLE ROW LEVEL SECURITY;

-- AI Evaluations & Decisions
CREATE TABLE IF NOT EXISTS public.ai_evaluations (
    id TEXT PRIMARY KEY,
    lead_id TEXT REFERENCES public.leads(id) ON DELETE CASCADE,
    evaluation_type TEXT NOT NULL, -- 'qualification', 'temperature', 'next_best_action'
    result TEXT NOT NULL,
    score INT,
    confidence NUMERIC(4, 2),
    reasoning TEXT,
    model_version TEXT,
    user_action TEXT DEFAULT 'Pending', -- 'Accepted', 'Overridden', 'Dismissed'
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.ai_evaluations ENABLE ROW LEVEL SECURITY;

-- Messages (WhatsApp/Email)
CREATE TABLE IF NOT EXISTS public.messages (
    id TEXT PRIMARY KEY,
    lead_id TEXT REFERENCES public.leads(id) ON DELETE CASCADE,
    channel TEXT NOT NULL, -- 'WhatsApp', 'Email'
    direction TEXT NOT NULL, -- 'Inbound', 'Outbound'
    content TEXT,
    status TEXT DEFAULT 'Sent',
    sent_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Payments
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY,
    lead_id TEXT REFERENCES public.leads(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    discount NUMERIC(10, 2) DEFAULT 0,
    payment_method TEXT,
    transaction_id TEXT,
    status TEXT DEFAULT 'Pending', -- 'Pending', 'Paid', 'Failed', 'Refunded'
    payment_link TEXT,
    payment_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Enrollments
CREATE TABLE IF NOT EXISTS public.enrollments (
    id TEXT PRIMARY KEY,
    lead_id TEXT REFERENCES public.leads(id) ON DELETE CASCADE,
    program_id TEXT REFERENCES public.programs(id),
    batch TEXT,
    amount_paid NUMERIC(10, 2),
    enrollment_date TIMESTAMPTZ DEFAULT NOW(),
    salesperson_id UUID REFERENCES public.profiles(id),
    lead_source TEXT,
    campaign TEXT,
    days_to_convert INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    old_value JSONB,
    new_value JSONB,
    changed_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Public RLS access for dev
CREATE POLICY "Allow public all access on profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on import_batches" ON public.import_batches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on lead_activities" ON public.lead_activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on lead_stage_history" ON public.lead_stage_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on calls" ON public.calls FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on notes" ON public.notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on follow_ups" ON public.follow_ups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on objections" ON public.objections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on lead_objections" ON public.lead_objections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on ai_evaluations" ON public.ai_evaluations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on messages" ON public.messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on enrollments" ON public.enrollments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all access on notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
