
-- =============================================
-- Phase 4: Case Management Tables
-- =============================================

CREATE TABLE public.org_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  case_number TEXT NOT NULL,
  client_name TEXT,
  client_identifier TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'medium',
  category TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, case_number)
);

ALTER TABLE public.org_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view their org cases"
  ON public.org_cases FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Org admins can manage cases"
  ON public.org_cases FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = org_cases.organization_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
  ));

CREATE POLICY "Platform admins can manage all cases"
  ON public.org_cases FOR ALL
  USING (is_admin_user());

-- Case Notes
CREATE TABLE public.org_case_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.org_cases(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  note_type TEXT NOT NULL DEFAULT 'general',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.org_case_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view case notes"
  ON public.org_case_notes FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Org admins can manage case notes"
  ON public.org_case_notes FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = org_case_notes.organization_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
  ));

CREATE POLICY "Platform admins can manage all case notes"
  ON public.org_case_notes FOR ALL
  USING (is_admin_user());

-- Indexes for cases
CREATE INDEX idx_org_cases_org_id ON public.org_cases(organization_id);
CREATE INDEX idx_org_cases_status ON public.org_cases(status);
CREATE INDEX idx_org_cases_assigned ON public.org_cases(assigned_to);
CREATE INDEX idx_org_case_notes_case_id ON public.org_case_notes(case_id);

-- =============================================
-- Phase 5: Reporting - Materialized view for org metrics
-- =============================================

CREATE TABLE public.org_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  performed_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.org_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view activity log"
  ON public.org_activity_log FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Platform admins can manage all activity logs"
  ON public.org_activity_log FOR ALL
  USING (is_admin_user());

-- Service role can insert activity logs (from edge functions)
CREATE POLICY "Service role can insert activity logs"
  ON public.org_activity_log FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_org_activity_org_id ON public.org_activity_log(organization_id);
CREATE INDEX idx_org_activity_type ON public.org_activity_log(activity_type);
CREATE INDEX idx_org_activity_created ON public.org_activity_log(created_at);

-- =============================================
-- Phase 6: Intake Forms & Submissions
-- =============================================

CREATE TABLE public.org_intake_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  form_schema JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_public BOOLEAN NOT NULL DEFAULT false,
  settings JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.org_intake_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view intake forms"
  ON public.org_intake_forms FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Org admins can manage intake forms"
  ON public.org_intake_forms FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = org_intake_forms.organization_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
  ));

CREATE POLICY "Public can view active public forms"
  ON public.org_intake_forms FOR SELECT
  USING (is_active = true AND is_public = true);

CREATE POLICY "Platform admins can manage all intake forms"
  ON public.org_intake_forms FOR ALL
  USING (is_admin_user());

-- Intake Submissions
CREATE TABLE public.org_intake_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES public.org_intake_forms(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  responses JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'new',
  priority TEXT DEFAULT 'medium',
  assigned_case_id UUID REFERENCES public.org_cases(id),
  submitter_name TEXT,
  submitter_contact TEXT,
  source TEXT DEFAULT 'widget',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.org_intake_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view submissions"
  ON public.org_intake_submissions FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Org admins can manage submissions"
  ON public.org_intake_submissions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = org_intake_submissions.organization_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
  ));

CREATE POLICY "Anyone can create submissions for public forms"
  ON public.org_intake_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Platform admins can manage all submissions"
  ON public.org_intake_submissions FOR ALL
  USING (is_admin_user());

-- Indexes for intake
CREATE INDEX idx_org_intake_forms_org ON public.org_intake_forms(organization_id);
CREATE INDEX idx_org_intake_subs_form ON public.org_intake_submissions(form_id);
CREATE INDEX idx_org_intake_subs_org ON public.org_intake_submissions(organization_id);
CREATE INDEX idx_org_intake_subs_status ON public.org_intake_submissions(status);
