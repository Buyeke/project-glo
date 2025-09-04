-- Fix critical security vulnerabilities by implementing comprehensive RLS policies

-- 1. DROP existing permissive policies and replace with restrictive ones for profiles table
DROP POLICY IF EXISTS "Anyone can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;

-- Ensure only authenticated users can view their own profiles or admins can view all
CREATE POLICY "Users can only view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles  
FOR SELECT
TO authenticated
USING (is_admin_user());

-- 2. Secure job_applicants table - restrict access to applicants and employers only
DROP POLICY IF EXISTS "Public can view applications" ON public.job_applicants;

CREATE POLICY "Applicants can view their own applications"
ON public.job_applicants
FOR SELECT
TO authenticated
USING (applicant_user_id = auth.uid());

CREATE POLICY "Employers can view applications for their jobs"
ON public.job_applicants
FOR SELECT
TO authenticated
USING (job_posting_id IN (
  SELECT jp.id 
  FROM job_postings jp
  JOIN employer_profiles ep ON jp.employer_id = ep.id
  WHERE ep.user_id = auth.uid()
));

-- 3. Secure employer_profiles table - only allow employers to see their own data
DROP POLICY IF EXISTS "Public can view employer profiles" ON public.employer_profiles;

CREATE POLICY "Employers can only view their own profile"
ON public.employer_profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 4. Secure ngo_details table - restrict to verified NGOs and their own data
DROP POLICY IF EXISTS "Public can view all NGO details" ON public.ngo_details;

CREATE POLICY "NGOs can view their own details"
ON public.ngo_details
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Public can only view verified NGO basic info"
ON public.ngo_details
FOR SELECT
TO anon, authenticated
USING (verified = true AND contact_email IS NULL AND contact_phone IS NULL);

-- 5. Secure user_assessments table - restrict to users and admins only
DROP POLICY IF EXISTS "Public can view assessments" ON public.user_assessments;

CREATE POLICY "Users can view their own assessments"
ON public.user_assessments
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 6. Secure donations table - restrict donor information access
DROP POLICY IF EXISTS "Public can view donations" ON public.donations;

CREATE POLICY "Only admins can view donation details"
ON public.donations
FOR SELECT
TO authenticated
USING (is_admin_user());

CREATE POLICY "Anyone can create anonymous donations"
ON public.donations
FOR INSERT
TO anon, authenticated
WITH CHECK (anonymous = true OR donor_email IS NULL);

-- 7. Secure messages table - ensure only sender/recipient can access
DROP POLICY IF EXISTS "Public can view messages" ON public.messages;

CREATE POLICY "Users can view their own messages"
ON public.messages
FOR SELECT
TO authenticated
USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- 8. Secure service_providers table - hide sensitive contact info from public
DROP POLICY IF EXISTS "Public can view all provider details" ON public.service_providers;

CREATE POLICY "Public can view basic provider info only"
ON public.service_providers
FOR SELECT
TO anon, authenticated
USING (
  verification_status = 'verified' 
  AND is_active = true 
  AND (contact_info IS NULL OR contact_info = '{}')
);

CREATE POLICY "Admins can view all provider details"
ON public.service_providers
FOR SELECT
TO authenticated
USING (is_admin_user());

-- 9. Add default deny policies to prevent any unintended public access
CREATE POLICY "Deny all public access to profiles"
ON public.profiles
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny all public access to job_applicants"
ON public.job_applicants
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny all public access to employer_profiles"
ON public.employer_profiles
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny all public access to user_assessments"
ON public.user_assessments
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny all public access to messages"
ON public.messages
FOR ALL
TO anon
USING (false)
WITH CHECK (false);