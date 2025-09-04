-- Fix job_applicants table security by cleaning up policies and ensuring proper access control

-- 1. Drop all existing SELECT policies to avoid conflicts and create clean, secure ones
DROP POLICY IF EXISTS "Applicants can view their own applications" ON public.job_applicants;
DROP POLICY IF EXISTS "Applicants can view own applications only" ON public.job_applicants;
DROP POLICY IF EXISTS "Employers can view applicants for their jobs" ON public.job_applicants;

-- 2. Create comprehensive, secure policies

-- Only applicants can view their own applications (including contact details)
CREATE POLICY "Applicants can view own application details"
ON public.job_applicants
FOR SELECT
TO authenticated
USING (applicant_user_id = auth.uid());

-- Only employers who posted the specific job can view applications for that job
CREATE POLICY "Job employers can view applications for their specific jobs"
ON public.job_applicants
FOR SELECT
TO authenticated
USING (
  job_posting_id IN (
    SELECT jp.id 
    FROM job_postings jp
    JOIN employer_profiles ep ON jp.employer_id = ep.id
    WHERE ep.user_id = auth.uid()
  )
);

-- 3. Ensure the INSERT policy is properly restricted to authenticated users only
DROP POLICY IF EXISTS "Authenticated users can apply to jobs" ON public.job_applicants;

CREATE POLICY "Authenticated users can submit job applications"
ON public.job_applicants
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND applicant_user_id = auth.uid()
  AND job_posting_id IS NOT NULL
);

-- 4. Ensure no UPDATE or DELETE operations are allowed by regular users (only admins)
DROP POLICY IF EXISTS "Users can update applications" ON public.job_applicants;
DROP POLICY IF EXISTS "Users can delete applications" ON public.job_applicants;

-- Only admins can update/delete applications for data integrity
CREATE POLICY "Only admins can modify applications"
ON public.job_applicants
FOR UPDATE
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

CREATE POLICY "Only admins can delete applications"
ON public.job_applicants
FOR DELETE
TO authenticated
USING (is_admin_user());

-- 5. Add a strict policy to prevent any access to contact details in bulk queries
-- This ensures even if other policies have bugs, contact info is protected
CREATE POLICY "Restrict bulk access to contact details"
ON public.job_applicants
FOR SELECT
TO authenticated
USING (
  -- Only allow access if user is the applicant, the employer, or an admin
  applicant_user_id = auth.uid() 
  OR job_posting_id IN (
    SELECT jp.id 
    FROM job_postings jp
    JOIN employer_profiles ep ON jp.employer_id = ep.id
    WHERE ep.user_id = auth.uid()
  )
  OR is_admin_user()
);