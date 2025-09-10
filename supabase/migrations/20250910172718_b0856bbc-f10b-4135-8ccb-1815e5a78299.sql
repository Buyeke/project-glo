-- Fix data exposure vulnerabilities by tightening RLS policies

-- Drop overly permissive policies and replace with secure ones
DROP POLICY IF EXISTS "Anyone can insert profile" ON public.profiles;
DROP POLICY IF EXISTS "Public can view basic employer data" ON public.employer_profiles;
DROP POLICY IF EXISTS "Anyone can view published resources" ON public.resources;

-- Ensure profiles table is properly secured
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create strict profile policies
CREATE POLICY "Users can insert their own profile only" ON public.profiles
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view only their own profile" ON public.profiles
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update only their own profile" ON public.profiles
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles for case management" ON public.profiles
FOR SELECT 
TO authenticated
USING (is_admin_user());

CREATE POLICY "Admins can update all profiles for case management" ON public.profiles
FOR UPDATE 
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Secure job_applicants table - remove public access
DROP POLICY IF EXISTS "Deny anonymous access to job applicants" ON public.job_applicants;
DROP POLICY IF EXISTS "Restrict bulk access to contact details" ON public.job_applicants;

CREATE POLICY "Strict job applicant access control" ON public.job_applicants
FOR SELECT 
TO authenticated
USING (
  (applicant_user_id = auth.uid()) OR 
  (job_posting_id IN (
    SELECT jp.id FROM job_postings jp 
    JOIN employer_profiles ep ON jp.employer_id = ep.id 
    WHERE ep.user_id = auth.uid()
  )) OR 
  is_admin_user()
);

-- Secure employer_profiles table completely
DROP POLICY IF EXISTS "Employers view own profile only" ON public.employer_profiles;
DROP POLICY IF EXISTS "Employers can view own profile" ON public.employer_profiles;

CREATE POLICY "Employers can only view their own profile" ON public.employer_profiles
FOR SELECT 
TO authenticated
USING (user_id = auth.uid() OR is_admin_user());

-- Secure donations table - remove broad access
DROP POLICY IF EXISTS "Block anonymous access to donations" ON public.donations;

CREATE POLICY "Strict donation data access" ON public.donations
FOR SELECT 
TO authenticated
USING (is_admin_user());

-- Ensure contact_submissions are admin-only
DROP POLICY IF EXISTS "Log contact submission access" ON public.contact_submissions;

CREATE POLICY "Only verified admins can view contact submissions" ON public.contact_submissions
FOR SELECT 
TO authenticated
USING (is_admin_user());

-- Secure NGO data
CREATE POLICY "NGO data admin access only" ON public.ngo_public_info
FOR SELECT 
TO authenticated
USING (is_admin_user() OR id = auth.uid());

-- Enable RLS on any tables that might not have it
ALTER TABLE public.ngo_public_info ENABLE ROW LEVEL SECURITY;

-- Remove any security definer views that might be exposing data
DROP VIEW IF EXISTS public.public_profiles;
DROP VIEW IF EXISTS public.employer_directory;

-- Add additional security for service_requests_tracking (support requests)
DROP POLICY IF EXISTS "Admins can view all service requests" ON public.service_requests_tracking;

CREATE POLICY "Strict service request access" ON public.service_requests_tracking
FOR SELECT 
TO authenticated
USING (user_id = auth.uid() OR is_admin_user());

-- Ensure all sensitive tables have proper deletion restrictions
CREATE POLICY "Only admins can delete profiles" ON public.profiles
FOR DELETE 
TO authenticated
USING (is_admin_user());

-- Log this security hardening
INSERT INTO public.security_logs (
  event_type,
  event_data
) VALUES (
  'admin_access',
  jsonb_build_object(
    'action', 'rls_policies_hardened',
    'tables_secured', ARRAY['profiles', 'job_applicants', 'employer_profiles', 'donations', 'contact_submissions'],
    'timestamp', NOW()
  )
);