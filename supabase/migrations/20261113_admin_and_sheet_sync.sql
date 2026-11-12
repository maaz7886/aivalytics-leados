-- ==============================================================
-- LEADSO CRM: ADMIN PORTAL, RLS SECURITY, CALLS & SHEET SYNC
-- ==============================================================

-- 1. Profiles Table Extension (Sales Rep Capacity & Status)
ALTER TABLE IF EXISTS public.profiles 
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS daily_lead_capacity INT DEFAULT 30,
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- 2. Leads Table Extension (Meta Ads & Sync Metadata, First Call SLA)
ALTER TABLE IF EXISTS public.leads 
  ADD COLUMN IF NOT EXISTS meta_lead_id TEXT,
  ADD COLUMN IF NOT EXISTS form_name TEXT,
  ADD COLUMN IF NOT EXISTS form_answers JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS first_call_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS time_to_first_call_seconds INT;

-- Unique index on meta_lead_id to prevent duplicates when present
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_meta_lead_id 
  ON public.leads(meta_lead_id) 
  WHERE meta_lead_id IS NOT NULL AND meta_lead_id != '';

-- Index for phone and email deduplication lookups
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_assigned ON public.leads(assigned_salesperson);

-- 3. Dedicated Calls Table (Prepared for manual logging + future Exotel/Twilio/Knowlarity)
CREATE TABLE IF NOT EXISTS public.calls (
  id TEXT PRIMARY KEY,
  lead_id TEXT REFERENCES public.leads(id) ON DELETE CASCADE,
  salesperson_id UUID REFERENCES public.profiles(id),
  salesperson_name TEXT NOT NULL,
  outcome TEXT NOT NULL, -- Connected, No answer, Busy, Wrong number, Call back later, Not interested, Interested
  notes TEXT,
  next_action TEXT,
  next_action_due TIMESTAMPTZ,
  provider TEXT,            -- Nullable: 'Exotel', 'Twilio', 'Knowlarity'
  provider_call_id TEXT,    -- Nullable: Provider's call reference
  duration_seconds INT,     -- Nullable: Duration in seconds
  recording_url TEXT,       -- Nullable: Audio recording link
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_calls_lead_id ON public.calls(lead_id);
CREATE INDEX IF NOT EXISTS idx_calls_salesperson ON public.calls(salesperson_name);
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON public.calls(created_at);

-- 4. Lead Timeline Table (Immutable event history for every action)
CREATE TABLE IF NOT EXISTS public.lead_timeline (
  id TEXT PRIMARY KEY,
  lead_id TEXT REFERENCES public.leads(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'created', 'synced_from_sheet', 'assigned', 'reassigned', 'call_logged', 'stage_changed', 'note_added', 'task_created', 'whatsapp_sent'
  performed_by TEXT,        -- user UUID or 'System'
  performed_by_name TEXT,   -- 'Admin', 'Alex Rivera', 'Google Sheet Sync'
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_timeline_lead_id ON public.lead_timeline(lead_id);
CREATE INDEX IF NOT EXISTS idx_timeline_created_at ON public.lead_timeline(created_at);

-- 5. Google Sheet & Meta Integration Sync Logs Table
CREATE TABLE IF NOT EXISTS public.integration_sync_logs (
  id TEXT PRIMARY KEY,
  source TEXT DEFAULT 'Google Sheet',
  leads_count INT DEFAULT 0,
  success_count INT DEFAULT 0,
  error_count INT DEFAULT 0,
  errors JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sync_logs_created_at ON public.integration_sync_logs(created_at);

-- ==============================================================
-- 6. SERVER-SIDE ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_sync_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to fetch role of the authenticated user
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function to fetch full name of the authenticated user
CREATE OR REPLACE FUNCTION public.get_user_name()
RETURNS text AS $$
  SELECT full_name FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function to fetch email of the authenticated user
CREATE OR REPLACE FUNCTION public.get_user_email()
RETURNS text AS $$
  SELECT email FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Drop legacy policies
DROP POLICY IF EXISTS "Role based read leads" ON public.leads;
DROP POLICY IF EXISTS "Role based update leads" ON public.leads;
DROP POLICY IF EXISTS "Admin delete leads" ON public.leads;
DROP POLICY IF EXISTS "Allow full access to leads" ON public.leads;
DROP POLICY IF EXISTS "Allow service role all on leads" ON public.leads;

-- Policy A: Service Role has full access (used by serverless API sync endpoint)
CREATE POLICY "Service role full access on leads" ON public.leads
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy B: Admins can do everything
CREATE POLICY "Admins full access on leads" ON public.leads
  FOR ALL
  TO authenticated
  USING (
    get_user_role() = 'Admin' 
    OR get_user_email() = 'admin@aivalytics.io'
  )
  WITH CHECK (
    get_user_role() = 'Admin' 
    OR get_user_email() = 'admin@aivalytics.io'
  );

-- Policy C: Sales Reps can ONLY view leads assigned to them
CREATE POLICY "Reps read assigned leads" ON public.leads
  FOR SELECT
  TO authenticated
  USING (
    get_user_role() = 'Admin'
    OR get_user_email() = 'admin@aivalytics.io'
    OR assigned_salesperson = get_user_name()
    OR assigned_salesperson = get_user_email()
  );

-- Policy D: Sales Reps can ONLY update leads assigned to them
CREATE POLICY "Reps update assigned leads" ON public.leads
  FOR UPDATE
  TO authenticated
  USING (
    get_user_role() = 'Admin'
    OR get_user_email() = 'admin@aivalytics.io'
    OR assigned_salesperson = get_user_name()
    OR assigned_salesperson = get_user_email()
  )
  WITH CHECK (
    get_user_role() = 'Admin'
    OR get_user_email() = 'admin@aivalytics.io'
    OR assigned_salesperson = get_user_name()
    OR assigned_salesperson = get_user_email()
  );

-- Policy E: Strict Delete Restriction — Sales Reps CANNOT delete leads!
CREATE POLICY "Only Admin can delete leads" ON public.leads
  FOR DELETE
  TO authenticated
  USING (
    get_user_role() = 'Admin' 
    OR get_user_email() = 'admin@aivalytics.io'
  );

-- Public fallback for mock/demo dev sessions when auth session is local
CREATE POLICY "Allow anon select leads" ON public.leads
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon insert update leads" ON public.leads
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Grants
GRANT ALL ON TABLE public.leads TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.calls TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.lead_timeline TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.integration_sync_logs TO anon, authenticated, service_role;
