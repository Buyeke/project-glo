
-- Phase 1: Organizations table
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  website TEXT,
  description TEXT,
  logo_url TEXT,
  tier TEXT NOT NULL DEFAULT 'community' CHECK (tier IN ('community', 'professional', 'enterprise')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  settings JSONB DEFAULT '{}'::jsonb,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Org owners can manage their own org
CREATE POLICY "Owners can manage their organization"
ON public.organizations FOR ALL
USING (owner_user_id = auth.uid())
WITH CHECK (owner_user_id = auth.uid());

-- Admins can view all orgs
CREATE POLICY "Admins can view all organizations"
ON public.organizations FOR SELECT
USING (is_admin_user());

-- Admins can manage all orgs
CREATE POLICY "Admins can manage all organizations"
ON public.organizations FOR ALL
USING (is_admin_user());

-- Phase 1: Organization members (staff roles within an org)
CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Members can view their own org members
CREATE POLICY "Members can view org members"
ON public.organization_members FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  )
);

-- Org owners/admins can manage members
CREATE POLICY "Org admins can manage members"
ON public.organization_members FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = organization_members.organization_id
    AND om.user_id = auth.uid()
    AND om.role IN ('owner', 'admin')
  )
);

-- Platform admins can manage all
CREATE POLICY "Platform admins can manage all members"
ON public.organization_members FOR ALL
USING (is_admin_user());

-- Phase 1: API Keys table
CREATE TABLE public.organization_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Default',
  scopes TEXT[] NOT NULL DEFAULT ARRAY['knowledge_base:read', 'widget:embed'],
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  rate_limit_per_minute INTEGER NOT NULL DEFAULT 60,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.organization_api_keys ENABLE ROW LEVEL SECURITY;

-- Org members can view their API keys
CREATE POLICY "Org members can view API keys"
ON public.organization_api_keys FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  )
);

-- Org owners/admins can manage API keys
CREATE POLICY "Org admins can manage API keys"
ON public.organization_api_keys FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = organization_api_keys.organization_id
    AND om.user_id = auth.uid()
    AND om.role IN ('owner', 'admin')
  )
);

-- Platform admins
CREATE POLICY "Platform admins can manage all API keys"
ON public.organization_api_keys FOR ALL
USING (is_admin_user());

-- Phase 2: Organization Knowledge Base
CREATE TABLE public.organization_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  language TEXT NOT NULL DEFAULT 'en',
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.organization_knowledge_base ENABLE ROW LEVEL SECURITY;

-- Org members can view their knowledge base
CREATE POLICY "Org members can view knowledge base"
ON public.organization_knowledge_base FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  )
);

-- Org admins can manage knowledge base
CREATE POLICY "Org admins can manage knowledge base"
ON public.organization_knowledge_base FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.organization_members om
    WHERE om.organization_id = organization_knowledge_base.organization_id
    AND om.user_id = auth.uid()
    AND om.role IN ('owner', 'admin')
  )
);

-- Platform admins
CREATE POLICY "Platform admins can manage all knowledge bases"
ON public.organization_knowledge_base FOR ALL
USING (is_admin_user());

-- Phase 3: Widget chat sessions (for embedded chatbot tracking)
CREATE TABLE public.widget_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  visitor_id TEXT,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.widget_chat_sessions ENABLE ROW LEVEL SECURITY;

-- Org members can view their chat sessions
CREATE POLICY "Org members can view widget sessions"
ON public.widget_chat_sessions FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  )
);

-- Platform admins
CREATE POLICY "Platform admins can manage all widget sessions"
ON public.widget_chat_sessions FOR ALL
USING (is_admin_user());

-- Service role inserts (from edge functions with API key auth)
CREATE POLICY "Service role can insert widget sessions"
ON public.widget_chat_sessions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service role can update widget sessions"
ON public.widget_chat_sessions FOR UPDATE
USING (true);

-- Helper function to validate API key and return org_id
CREATE OR REPLACE FUNCTION public.validate_api_key(p_key_hash TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_org_id UUID;
BEGIN
  SELECT organization_id INTO v_org_id
  FROM organization_api_keys
  WHERE key_hash = p_key_hash
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now());

  IF v_org_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Update last_used_at
  UPDATE organization_api_keys
  SET last_used_at = now()
  WHERE key_hash = p_key_hash;

  RETURN v_org_id;
END;
$$;

-- Indexes for performance
CREATE INDEX idx_org_knowledge_base_org_id ON public.organization_knowledge_base(organization_id);
CREATE INDEX idx_org_knowledge_base_category ON public.organization_knowledge_base(category);
CREATE INDEX idx_org_knowledge_base_language ON public.organization_knowledge_base(language);
CREATE INDEX idx_org_api_keys_key_hash ON public.organization_api_keys(key_hash);
CREATE INDEX idx_org_api_keys_org_id ON public.organization_api_keys(organization_id);
CREATE INDEX idx_org_members_user_id ON public.organization_members(user_id);
CREATE INDEX idx_org_members_org_id ON public.organization_members(organization_id);
CREATE INDEX idx_widget_sessions_org_id ON public.widget_chat_sessions(organization_id);
CREATE INDEX idx_widget_sessions_token ON public.widget_chat_sessions(session_token);
CREATE INDEX idx_organizations_slug ON public.organizations(slug);
