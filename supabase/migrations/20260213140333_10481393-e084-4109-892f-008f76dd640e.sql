
-- Fix overly permissive widget_chat_sessions policies
-- Drop the permissive ones and replace with proper service-role scoped ones
DROP POLICY IF EXISTS "Service role can insert widget sessions" ON public.widget_chat_sessions;
DROP POLICY IF EXISTS "Service role can update widget sessions" ON public.widget_chat_sessions;

-- Only allow inserts/updates when org_id matches a valid active organization
CREATE POLICY "Validated inserts to widget sessions"
ON public.widget_chat_sessions FOR INSERT
WITH CHECK (
  organization_id IN (SELECT id FROM public.organizations WHERE is_active = true)
);

CREATE POLICY "Validated updates to widget sessions"
ON public.widget_chat_sessions FOR UPDATE
USING (
  organization_id IN (SELECT id FROM public.organizations WHERE is_active = true)
);
