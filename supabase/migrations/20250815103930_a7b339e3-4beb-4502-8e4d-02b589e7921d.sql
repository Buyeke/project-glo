-- Fix job applicants security vulnerability
-- Remove dangerous anonymous application policy and implement proper authentication

-- Drop the existing insecure policy that allows anyone to apply
DROP POLICY IF EXISTS "Anyone can apply to jobs" ON public.job_applicants;

-- Create secure policies that require authentication
CREATE POLICY "Authenticated users can apply to jobs" ON public.job_applicants
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND 
  applicant_user_id = auth.uid()
);

-- Update the existing view policy to be more specific
DROP POLICY IF EXISTS "Applicants can view their own applications" ON public.job_applicants;
CREATE POLICY "Applicants can view their own applications" ON public.job_applicants
FOR SELECT USING (
  applicant_user_id = auth.uid()
);

-- Update the employer view policy to be more secure
DROP POLICY IF EXISTS "Employers can view applicants for their jobs" ON public.job_applicants;
CREATE POLICY "Employers can view applicants for their jobs" ON public.job_applicants
FOR SELECT USING (
  job_posting_id IN (
    SELECT jp.id FROM job_postings jp
    JOIN employer_profiles ep ON jp.employer_id = ep.id
    WHERE ep.user_id = auth.uid()
  )
);

-- Make applicant_user_id NOT NULL to enforce authentication requirement
ALTER TABLE public.job_applicants 
ALTER COLUMN applicant_user_id SET NOT NULL;

-- Add a constraint to ensure applicant_user_id matches the authenticated user
-- This prevents users from applying on behalf of others
ALTER TABLE public.job_applicants 
ADD CONSTRAINT check_applicant_user_id_matches_auth 
CHECK (applicant_user_id = auth.uid());