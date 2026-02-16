
-- ============================================================
-- GLO Education API v1.2.0 — Batch 1 Database Migration
-- 8 tables + RLS + helper function
-- ============================================================

-- 1. edu_semesters
CREATE TABLE public.edu_semesters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  student_capacity integer NOT NULL DEFAULT 40,
  is_active boolean NOT NULL DEFAULT true,
  settings jsonb NOT NULL DEFAULT '{
    "rate_limit_normal": 100,
    "rate_limit_assignment": 500,
    "rate_limit_off_semester": 0
  }'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.edu_semesters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view semesters"
  ON public.edu_semesters FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Org admins can manage semesters"
  ON public.edu_semesters FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = edu_semesters.organization_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin', 'faculty')
  ));

CREATE POLICY "Platform admins can manage all semesters"
  ON public.edu_semesters FOR ALL
  USING (is_admin_user());

-- 2. edu_students
CREATE TABLE public.edu_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  semester_id uuid NOT NULL REFERENCES public.edu_semesters(id) ON DELETE CASCADE,
  student_id_external text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  user_id uuid REFERENCES public.profiles(id),
  role text NOT NULL DEFAULT 'read_only',
  ethics_certified boolean NOT NULL DEFAULT false,
  ethics_certified_at timestamptz,
  ethics_cert_id text,
  ethics_quiz_score numeric,
  status text NOT NULL DEFAULT 'active',
  api_key_hash text,
  rate_limit_override integer,
  last_active_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, semester_id, student_id_external)
);

ALTER TABLE public.edu_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org admins can manage students"
  ON public.edu_students FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = edu_students.organization_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin', 'faculty')
  ));

CREATE POLICY "Students can view own record"
  ON public.edu_students FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Platform admins can manage all students"
  ON public.edu_students FOR ALL
  USING (is_admin_user());

CREATE POLICY "Service role can manage students"
  ON public.edu_students FOR ALL
  USING (true)
  WITH CHECK (true);

-- 3. edu_api_usage
CREATE TABLE public.edu_api_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.edu_students(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  method text NOT NULL DEFAULT 'GET',
  status_code integer,
  response_time_ms integer,
  is_sandbox boolean NOT NULL DEFAULT false,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_edu_api_usage_student_date ON public.edu_api_usage (student_id, created_at);
CREATE INDEX idx_edu_api_usage_org_date ON public.edu_api_usage (organization_id, created_at);

ALTER TABLE public.edu_api_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org admins can view usage"
  ON public.edu_api_usage FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = edu_api_usage.organization_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin', 'faculty')
  ));

CREATE POLICY "Students can view own usage"
  ON public.edu_api_usage FOR SELECT
  USING (student_id IN (
    SELECT id FROM public.edu_students WHERE user_id = auth.uid()
  ));

CREATE POLICY "Service role can insert usage"
  ON public.edu_api_usage FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Platform admins can manage all usage"
  ON public.edu_api_usage FOR ALL
  USING (is_admin_user());

-- 4. edu_sandbox_data
CREATE TABLE public.edu_sandbox_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  data_type text NOT NULL DEFAULT 'case',
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  language text NOT NULL DEFAULT 'en',
  refresh_batch_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.edu_sandbox_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can read sandbox data"
  ON public.edu_sandbox_data FOR SELECT
  USING (
    organization_id IS NULL
    OR organization_id IN (
      SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage sandbox data"
  ON public.edu_sandbox_data FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Platform admins can manage all sandbox data"
  ON public.edu_sandbox_data FOR ALL
  USING (is_admin_user());

-- 5. edu_projects
CREATE TABLE public.edu_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.edu_students(id) ON DELETE CASCADE,
  assignment_id uuid,
  title text NOT NULL,
  type text NOT NULL DEFAULT 'analysis',
  description text,
  repo_url text,
  api_calls_used integer NOT NULL DEFAULT 0,
  endpoints_used text[] NOT NULL DEFAULT '{}',
  datasets_used text[] NOT NULL DEFAULT '{}',
  complexity_score numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  grade text,
  faculty_comments text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.edu_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org admins can manage projects"
  ON public.edu_projects FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = edu_projects.organization_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin', 'faculty')
  ));

CREATE POLICY "Students can manage own projects"
  ON public.edu_projects FOR ALL
  USING (student_id IN (
    SELECT id FROM public.edu_students WHERE user_id = auth.uid()
  ));

CREATE POLICY "Platform admins can manage all projects"
  ON public.edu_projects FOR ALL
  USING (is_admin_user());

-- 6. edu_assignments
CREATE TABLE public.edu_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  semester_id uuid REFERENCES public.edu_semesters(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  difficulty text NOT NULL DEFAULT 'beginner',
  starter_query text,
  deadline timestamptz,
  rate_override_per_day integer,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.edu_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org admins can manage assignments"
  ON public.edu_assignments FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = edu_assignments.organization_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin', 'faculty')
  ));

CREATE POLICY "Org members can view assignments"
  ON public.edu_assignments FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Platform admins can manage all assignments"
  ON public.edu_assignments FOR ALL
  USING (is_admin_user());

-- Add FK from edu_projects to edu_assignments now that table exists
ALTER TABLE public.edu_projects
  ADD CONSTRAINT edu_projects_assignment_id_fkey
  FOREIGN KEY (assignment_id) REFERENCES public.edu_assignments(id) ON DELETE SET NULL;

-- 7. edu_anonymization_log
CREATE TABLE public.edu_anonymization_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.edu_students(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  fields_anonymized text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_edu_anon_log_student ON public.edu_anonymization_log (student_id, created_at);

ALTER TABLE public.edu_anonymization_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org admins can view anonymization logs"
  ON public.edu_anonymization_log FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = edu_anonymization_log.organization_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin', 'faculty')
  ));

CREATE POLICY "Service role can insert anonymization logs"
  ON public.edu_anonymization_log FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Platform admins can manage all anonymization logs"
  ON public.edu_anonymization_log FOR ALL
  USING (is_admin_user());

-- 8. edu_docs
CREATE TABLE public.edu_docs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_type text NOT NULL DEFAULT 'schema',
  title text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  language text NOT NULL DEFAULT 'en',
  version text NOT NULL DEFAULT '1.0',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.edu_docs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read education docs"
  ON public.edu_docs FOR SELECT
  USING (true);

CREATE POLICY "Platform admins can manage docs"
  ON public.edu_docs FOR ALL
  USING (is_admin_user());

CREATE POLICY "Service role can manage docs"
  ON public.edu_docs FOR ALL
  USING (true)
  WITH CHECK (true);

-- Seed initial documentation
INSERT INTO public.edu_docs (doc_type, title, content, language, version) VALUES
('schema', 'GLO Education Data Dictionary', '{
  "tables": {
    "cases": {"description": "Anonymized case records", "fields": ["case_id", "category", "status", "priority", "county", "subcounty", "opened_at", "closed_at"]},
    "notes": {"description": "Anonymized case notes", "fields": ["note_id", "case_id", "note_type", "content_summary", "created_at"]},
    "intake": {"description": "Anonymized intake submissions", "fields": ["submission_id", "form_type", "status", "priority", "responses_summary", "created_at"]},
    "resources": {"description": "Available support resources", "fields": ["resource_id", "category", "title", "location_county", "service_type"]}
  }
}'::jsonb, 'en', '1.0'),
('examples', 'Sample API Queries', '{
  "examples": [
    {"title": "List all cases by category", "endpoint": "GET /education/sandbox?type=cases&category=protection", "description": "Retrieve anonymized protection cases"},
    {"title": "Get case notes", "endpoint": "GET /education/sandbox?type=notes&case_id=X", "description": "Retrieve notes for a specific case"},
    {"title": "Search intake submissions", "endpoint": "GET /education/sandbox?type=intake&status=new", "description": "Find new intake submissions"},
    {"title": "Submit project", "endpoint": "POST /education/projects", "description": "Submit a research project with repo URL and description"}
  ]
}'::jsonb, 'en', '1.0'),
('glossary', 'GBV & Social Work Terminology', '{
  "terms": [
    {"term": "GBV", "definition": "Gender-Based Violence — any harmful act perpetrated against a person based on gender"},
    {"term": "Case Management", "definition": "A collaborative process of assessment, planning, facilitation, and advocacy for options and services to meet an individual''s needs"},
    {"term": "Intake", "definition": "The initial process of gathering information from a person seeking services"},
    {"term": "Referral", "definition": "The process of directing a client to another service provider for additional support"},
    {"term": "Psychosocial Support", "definition": "Interventions that address psychological and social needs of individuals, families, and communities"},
    {"term": "Survivor-Centered Approach", "definition": "An approach that prioritizes the rights, needs, and wishes of the survivor"},
    {"term": "Mandatory Reporting", "definition": "Legal requirement for certain professionals to report suspected cases of abuse"},
    {"term": "Informed Consent", "definition": "Agreement given with full knowledge of the risks and benefits involved"},
    {"term": "Confidentiality", "definition": "The ethical principle of keeping client information private and secure"},
    {"term": "Duty of Care", "definition": "A legal obligation to ensure the safety and well-being of others"}
  ]
}'::jsonb, 'en', '1.0');
