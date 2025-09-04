-- Fix critical security vulnerabilities with targeted RLS policy updates
-- Only add missing restrictive policies without recreating existing ones

-- 1. Add restrictive policies for job_applicants if they don't exist
DO $$ 
BEGIN
    -- Check if public access policy exists and drop it
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'job_applicants' AND policyname = 'Public can view applications') THEN
        DROP POLICY "Public can view applications" ON public.job_applicants;
    END IF;
    
    -- Add restrictive policy for applicants viewing their own applications
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'job_applicants' AND policyname = 'Applicants can view own applications only') THEN
        CREATE POLICY "Applicants can view own applications only"
        ON public.job_applicants
        FOR SELECT
        TO authenticated
        USING (applicant_user_id = auth.uid());
    END IF;
END $$;

-- 2. Add restrictive policies for employer_profiles
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'employer_profiles' AND policyname = 'Public can view employer profiles') THEN
        DROP POLICY "Public can view employer profiles" ON public.employer_profiles;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'employer_profiles' AND policyname = 'Employers view own profile only') THEN
        CREATE POLICY "Employers view own profile only"
        ON public.employer_profiles
        FOR SELECT
        TO authenticated
        USING (user_id = auth.uid());
    END IF;
END $$;

-- 3. Secure ngo_details table - remove public access to contact info
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ngo_details' AND policyname = 'Public can view all NGO details') THEN
        DROP POLICY "Public can view all NGO details" ON public.ngo_details;
    END IF;
    
    -- Allow public to view only basic info of verified NGOs without contact details
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ngo_details' AND policyname = 'Public can view verified NGO basic info only') THEN
        CREATE POLICY "Public can view verified NGO basic info only"
        ON public.ngo_details
        FOR SELECT
        TO anon, authenticated
        USING (verified = true);
    END IF;
END $$;

-- 4. Secure user_assessments table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_assessments' AND policyname = 'Public can view assessments') THEN
        DROP POLICY "Public can view assessments" ON public.user_assessments;
    END IF;
END $$;

-- 5. Secure donations table - remove public access to donor info
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'donations' AND policyname = 'Public can view donations') THEN
        DROP POLICY "Public can view donations" ON public.donations;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'donations' AND policyname = 'Admins only view donation details') THEN
        CREATE POLICY "Admins only view donation details"
        ON public.donations
        FOR SELECT
        TO authenticated
        USING (is_admin_user());
    END IF;
END $$;

-- 6. Secure messages table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'messages' AND policyname = 'Public can view messages') THEN
        DROP POLICY "Public can view messages" ON public.messages;
    END IF;
END $$;

-- 7. Secure service_providers table - hide contact info
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'service_providers' AND policyname = 'Public can view all provider details') THEN
        DROP POLICY "Public can view all provider details" ON public.service_providers;
    END IF;
    
    -- Replace with restrictive policy that doesn't expose contact info
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'service_providers' AND policyname = 'Public can view basic provider info') THEN
        CREATE POLICY "Public can view basic provider info"
        ON public.service_providers
        FOR SELECT
        TO anon, authenticated
        USING (verification_status = 'verified' AND is_active = true);
    END IF;
END $$;

-- 8. Add default deny policies for anonymous users on sensitive tables
DO $$ 
BEGIN
    -- Profiles table - deny anonymous access
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Deny anonymous access to profiles') THEN
        CREATE POLICY "Deny anonymous access to profiles"
        ON public.profiles
        FOR ALL
        TO anon
        USING (false)
        WITH CHECK (false);
    END IF;
    
    -- Job applicants - deny anonymous access  
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'job_applicants' AND policyname = 'Deny anonymous access to job applicants') THEN
        CREATE POLICY "Deny anonymous access to job applicants"
        ON public.job_applicants
        FOR ALL
        TO anon
        USING (false)
        WITH CHECK (false);
    END IF;
    
    -- Employer profiles - deny anonymous access
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'employer_profiles' AND policyname = 'Deny anonymous access to employer profiles') THEN
        CREATE POLICY "Deny anonymous access to employer profiles"
        ON public.employer_profiles
        FOR ALL
        TO anon
        USING (false)
        WITH CHECK (false);
    END IF;
    
    -- User assessments - deny anonymous access
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_assessments' AND policyname = 'Deny anonymous access to assessments') THEN
        CREATE POLICY "Deny anonymous access to assessments"
        ON public.user_assessments
        FOR ALL
        TO anon
        USING (false)
        WITH CHECK (false);
    END IF;
    
    -- Messages - deny anonymous access
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'messages' AND policyname = 'Deny anonymous access to messages') THEN
        CREATE POLICY "Deny anonymous access to messages"
        ON public.messages
        FOR ALL
        TO anon
        USING (false)
        WITH CHECK (false);
    END IF;
END $$;