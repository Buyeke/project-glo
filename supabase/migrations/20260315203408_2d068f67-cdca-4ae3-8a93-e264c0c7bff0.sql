
-- LTI Platform registrations (registered Moodle instances)
CREATE TABLE public.lti_platforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issuer text NOT NULL,
  client_id text NOT NULL,
  deployment_id text NOT NULL DEFAULT '1',
  auth_login_url text NOT NULL,
  auth_token_url text NOT NULL,
  jwks_url text NOT NULL,
  institution_name text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(issuer, client_id)
);

ALTER TABLE public.lti_platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins can manage LTI platforms"
  ON public.lti_platforms FOR ALL
  USING (is_admin_user());

CREATE POLICY "Service role full access to LTI platforms"
  ON public.lti_platforms FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- LTI Nonces for replay prevention
CREATE TABLE public.lti_nonces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nonce text NOT NULL,
  platform_id uuid REFERENCES public.lti_platforms(id) ON DELETE CASCADE,
  used_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes')
);

ALTER TABLE public.lti_nonces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages nonces"
  ON public.lti_nonces FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- Index for fast nonce lookups
CREATE INDEX idx_lti_nonces_nonce ON public.lti_nonces(nonce);
CREATE INDEX idx_lti_nonces_expires ON public.lti_nonces(expires_at);

-- LTI launch sessions (maps LTI launches to GLO sessions)
CREATE TABLE public.lti_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id uuid REFERENCES public.lti_platforms(id) ON DELETE CASCADE NOT NULL,
  lti_user_id text NOT NULL,
  user_id uuid,
  student_id uuid REFERENCES public.edu_students(id),
  course_context jsonb DEFAULT '{}'::jsonb,
  resource_link jsonb DEFAULT '{}'::jsonb,
  ags_endpoint text,
  roles text[] DEFAULT '{}',
  state text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '8 hours')
);

ALTER TABLE public.lti_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages sessions"
  ON public.lti_sessions FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Users can view own LTI sessions"
  ON public.lti_sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE INDEX idx_lti_sessions_state ON public.lti_sessions(state);
CREATE INDEX idx_lti_sessions_lti_user ON public.lti_sessions(lti_user_id, platform_id);
