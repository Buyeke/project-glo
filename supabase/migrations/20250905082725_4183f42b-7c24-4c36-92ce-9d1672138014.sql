-- Security fixes for multiple tables with PII exposure issues (corrected)

-- 1. Fix employer_profiles table - ensure only profile owners and admins can access
-- Add explicit deny for anonymous users (if not already exists)
DO $$
BEGIN
  -- Drop and recreate to avoid conflicts
  DROP POLICY IF EXISTS "Deny anonymous access to employer contact details" ON public.employer_profiles;
  
  CREATE POLICY "Deny anonymous access to employer contact details"
  ON public.employer_profiles
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- Policy might already exist in some form
END;
$$;

-- 2. Fix ngo_details table - limit contact information access
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

-- 3. Fix support_requests table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'support_requests') THEN
    -- Enable RLS if not already enabled
    ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies to recreate them properly
    DROP POLICY IF EXISTS "Anyone can view support requests" ON public.support_requests;
    DROP POLICY IF EXISTS "Public can view support requests" ON public.support_requests;
    DROP POLICY IF EXISTS "Users can view their own support requests" ON public.support_requests;
    DROP POLICY IF EXISTS "Admins can view all support requests" ON public.support_requests;
    DROP POLICY IF EXISTS "Admins can manage support requests" ON public.support_requests;
    DROP POLICY IF EXISTS "Users can create their own support requests" ON public.support_requests;
    
    -- Create secure policies
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
    
    -- Deny anonymous access
    CREATE POLICY "Block anonymous access to support requests"
    ON public.support_requests
    FOR ALL
    TO anon
    USING (false)
    WITH CHECK (false);
  END IF;
END;
$$;

-- 4. Add additional security measures for donations table
-- Ensure all sensitive tables deny anonymous access explicitly
DROP POLICY IF EXISTS "Block anonymous access to donations" ON public.donations;
CREATE POLICY "Block anonymous access to donations"
ON public.donations
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- 5. Create a secure function for checking user permissions
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