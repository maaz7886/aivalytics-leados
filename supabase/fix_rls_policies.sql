-- ==============================================================
-- FIX RLS POLICIES FOR UNIVERSAL MULTI-PLATFORM CLOUD CRM ACCESS
-- ==============================================================

-- 1. Leads Table: Allow all operations (SELECT, INSERT, UPDATE, DELETE) for anon and authenticated users
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated insert leads" ON public.leads;
DROP POLICY IF EXISTS "Role based read leads" ON public.leads;
DROP POLICY IF EXISTS "Role based update leads" ON public.leads;
DROP POLICY IF EXISTS "Admin delete leads" ON public.leads;
DROP POLICY IF EXISTS "Allow public read access on leads" ON public.leads;
DROP POLICY IF EXISTS "Allow public insert access on leads" ON public.leads;
DROP POLICY IF EXISTS "Allow public update access on leads" ON public.leads;
DROP POLICY IF EXISTS "Allow full access to leads" ON public.leads;

CREATE POLICY "Allow full access to leads" ON public.leads
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 2. Programs Table: Allow full access
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on programs" ON public.programs;
DROP POLICY IF EXISTS "Allow full access to programs" ON public.programs;
CREATE POLICY "Allow full access to programs" ON public.programs
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 3. Lead Activities Table: Allow full access
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Role based read activities" ON public.lead_activities;
DROP POLICY IF EXISTS "Authenticated insert activities" ON public.lead_activities;
DROP POLICY IF EXISTS "Allow full access to activities" ON public.lead_activities;
CREATE POLICY "Allow full access to activities" ON public.lead_activities
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 4. Import Batches Table: Allow full access
ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Managers import access" ON public.import_batches;
DROP POLICY IF EXISTS "Allow full access to import_batches" ON public.import_batches;
CREATE POLICY "Allow full access to import_batches" ON public.import_batches
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Grant privileges explicitly to anon and authenticated roles
GRANT ALL ON TABLE public.leads TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.programs TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.lead_activities TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.import_batches TO anon, authenticated, service_role;
