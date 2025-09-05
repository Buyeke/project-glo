-- Fix security definer view issue
-- Recreate the view without SECURITY DEFINER property

DROP VIEW IF EXISTS public.ngo_public_info;

-- Create a standard view (not SECURITY DEFINER) for public NGO information
CREATE VIEW public.ngo_public_info AS
SELECT 
  id,
  organization_name,
  services_offered,
  location,
  website,
  description,
  verified,
  created_at
FROM public.ngo_details
WHERE verified = true;

-- Grant appropriate access to the view
GRANT SELECT ON public.ngo_public_info TO authenticated, anon;

-- Add RLS policy for the view to ensure it only shows verified NGOs
ALTER VIEW public.ngo_public_info SET (security_barrier = true);

-- Log this security fix
INSERT INTO public.security_logs (event_type, event_data, user_id)
VALUES (
  'admin_access',
  jsonb_build_object(
    'action', 'security_definer_view_fixed',
    'view_name', 'ngo_public_info',
    'timestamp', now()
  ),
  auth.uid()
);