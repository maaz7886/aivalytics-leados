-- =====================================================
-- STEP 2C: UNIVERSAL LEAD IMPORT + FLEXIBLE FIELDS + Q&A
-- =====================================================

-- 1. Custom Fields Definition
CREATE TABLE IF NOT EXISTS public.custom_fields (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'number', 'single select', 'multi select', 'date', 'yes/no', 'phone', 'url')),
  options JSONB DEFAULT '[]'::jsonb,
  program_scope TEXT NOT NULL DEFAULT 'All' CHECK (program_scope IN ('All', 'AI Builder', 'AI-PM')),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Contact Custom Field Values
CREATE TABLE IF NOT EXISTS public.contact_field_values (
  id TEXT PRIMARY KEY,
  contact_id TEXT NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  field_id TEXT NOT NULL REFERENCES public.custom_fields(id) ON DELETE CASCADE,
  field_key TEXT NOT NULL,
  value JSONB,
  source TEXT NOT NULL DEFAULT 'manual',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_by TEXT NOT NULL DEFAULT 'system',
  UNIQUE (contact_id, field_id)
);
CREATE INDEX IF NOT EXISTS idx_contact_field_values_contact ON public.contact_field_values(contact_id);

-- 3. Submissions (Audit record of every form fill, CSV row, webhook, or call)
CREATE TABLE IF NOT EXISTS public.submissions (
  id TEXT PRIMARY KEY,
  contact_id TEXT NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('Meta form', 'CSV import', 'Google Sheet', 'Paste', 'Website', 'Zoom registration', 'Manual', 'Call')),
  source_name TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  import_batch_id TEXT
);
CREATE INDEX IF NOT EXISTS idx_submissions_contact ON public.submissions(contact_id);

-- 4. Answers (Extracted Question -> Answer pairs per submission)
CREATE TABLE IF NOT EXISTS public.answers (
  id TEXT PRIMARY KEY,
  contact_id TEXT NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  submission_id TEXT NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  question_key TEXT NOT NULL,
  question_label TEXT NOT NULL,
  answer_value JSONB,
  answer_label TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_answers_contact ON public.answers(contact_id);
CREATE INDEX IF NOT EXISTS idx_answers_submission ON public.answers(submission_id);

-- 5. Mapping Templates (Saved column headers -> field mappings)
CREATE TABLE IF NOT EXISTS public.mapping_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  source_type TEXT NOT NULL,
  mappings JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Import Batches (With 24h undo support & conflict logs)
CREATE TABLE IF NOT EXISTS public.import_batches (
  id TEXT PRIMARY KEY,
  imported_by TEXT NOT NULL,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  source TEXT NOT NULL,
  filename TEXT NOT NULL,
  counts JSONB NOT NULL DEFAULT '{"total":0,"new":0,"updated":0,"duplicate":0,"invalid":0,"skipped":0}'::jsonb,
  conflicts JSONB DEFAULT '[]'::jsonb,
  errors JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'reverted')),
  undo_available_until TIMESTAMPTZ NOT NULL,
  revert_payload JSONB
);

-- 7. Question Bank (For call qualification & rep discovery)
CREATE TABLE IF NOT EXISTS public.question_bank (
  id TEXT PRIMARY KEY,
  program_scope TEXT NOT NULL CHECK (program_scope IN ('AI Builder', 'AI-PM', 'All')),
  question_text TEXT NOT NULL,
  question_key TEXT NOT NULL,
  field_id TEXT REFERENCES public.custom_fields(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'number', 'single select', 'multi select', 'date', 'yes/no', 'phone', 'url')),
  options JSONB DEFAULT '[]'::jsonb,
  display_order INT NOT NULL DEFAULT 1,
  required_before_payment_link BOOLEAN NOT NULL DEFAULT false
);

-- 8. Scoring Rules (Simple IF rules for auto temperature calculation)
CREATE TABLE IF NOT EXISTS public.scoring_rules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  program_scope TEXT DEFAULT 'All',
  conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  resulting_temperature TEXT NOT NULL CHECK (resulting_temperature IN ('Hot', 'Warm', 'Cold')),
  active BOOLEAN NOT NULL DEFAULT true
);

-- RLS Policies
ALTER TABLE public.custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mapping_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read custom_fields" ON public.custom_fields FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated manage custom_fields" ON public.custom_fields FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated read contact_field_values" ON public.contact_field_values FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated manage contact_field_values" ON public.contact_field_values FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated read submissions" ON public.submissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated manage submissions" ON public.submissions FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated read answers" ON public.answers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated manage answers" ON public.answers FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated read mapping_templates" ON public.mapping_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated manage mapping_templates" ON public.mapping_templates FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated read import_batches" ON public.import_batches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated manage import_batches" ON public.import_batches FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated read question_bank" ON public.question_bank FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated manage question_bank" ON public.question_bank FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated read scoring_rules" ON public.scoring_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated manage scoring_rules" ON public.scoring_rules FOR ALL TO authenticated USING (true);
