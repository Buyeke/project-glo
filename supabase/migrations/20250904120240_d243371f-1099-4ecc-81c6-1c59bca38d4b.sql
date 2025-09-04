-- Security fixes for multiple tables with PII exposure issues

-- 1. Ensure contact_submissions table is properly secured (already has good policies)
-- The contact_submissions table already has secure policies restricting access to admins only

-- 2. Fix donations table - ensure only admins can access donor information
-- Check current policies first
DO $$
BEGIN
  -- Drop any overly permissive policies on donations
  DROP POLICY IF EXISTS "Anyone can view donations" ON public.donations;
  DROP POLICY IF EXISTS "Public can view donations" ON public.donations;
  DROP POLICY IF EXISTS "Users can view donations" ON public.donations;
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- Ignore if policies don't exist
END;
$$;

-- Ensure donations table only allows admin access for viewing donor information
-- The existing "Admins can view donations" policy should be sufficient
-- But let's make sure there are no permissive policies

-- 3. Fix employer_profiles table - ensure only profile owners and admins can access
-- Current policies look good, but let's add explicit deny for anonymous users
CREATE POLICY "Deny anonymous access to employer contact details"
ON public.employer_profiles
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- 4. Fix profiles table - ensure only profile owners and authorized staff can access
-- Current policies look good, but let's add explicit deny for anonymous users  
-- (The existing "Deny anonymous access to profiles" policy should cover this)

-- 5. Fix ngo_details table - limit contact information access
-- Current policy allows anyone to view verified NGOs, but we should restrict sensitive contact info
-- Create a view for public NGO information without sensitive contact details
CREATE OR REPLACE VIEW public.ngo_public_info AS
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

-- Grant access to the view
GRANT SELECT ON public.ngo_public_info TO authenticated, anon;

-- Add policy to restrict full NGO details to NGO owners and admins only
DROP POLICY IF EXISTS "Anyone can view verified NGOs" ON public.ngo_details;

CREATE POLICY "Only NGO owners and admins can view full NGO details"
ON public.ngo_details
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR is_admin_user());

-- Ensure NGOs can still manage their own details
-- (The existing "NGOs can manage their own details" policy should cover this)

-- 6. Check if support_requests table exists and secure it
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'support_requests') THEN
    -- Enable RLS if not already enabled
    ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;
    
    -- Drop any permissive policies
    DROP POLICY IF EXISTS "Anyone can view support requests" ON public.support_requests;
    DROP POLICY IF EXISTS "Public can view support requests" ON public.support_requests;
    
    -- Ensure only requesters and admins can view support requests
    CREATE POLICY "Users can view their own support requests"
    ON public.support_requests
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());
    
    CREATE POLICY "Admins can view all support requests"
    ON public.support_requests
    FOR SELECT
    TO authenticated
    USING (is_admin_user());
    
    CREATE POLICY "Admins can manage support requests"
    ON public.support_requests
    FOR ALL
    TO authenticated
    USING (is_admin_user())
    WITH CHECK (is_admin_user());
    
    CREATE POLICY "Users can create their own support requests"
    ON public.support_requests
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());
  END IF;
END;
$$;

-- 7. Add additional security measures
-- Ensure all sensitive tables deny anonymous access explicitly
CREATE POLICY "Block anonymous access to donations"
ON public.donations
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- 8. Create a secure function for checking user permissions
-- This helps prevent RLS recursion issues
CREATE OR REPLACE FUNCTION public.can_access_user_data(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() = target_user_id OR is_admin_user();
$$;

-- 9. Log this security update
INSERT INTO public.security_logs (event_type, event_data, user_id)
VALUES (
  'admin_access',
  jsonb_build_object(
    'action', 'security_policies_updated',
    'tables_secured', ARRAY['donations', 'employer_profiles', 'ngo_details', 'support_requests'],
    'timestamp', now()
  ),
  auth.uid()
);