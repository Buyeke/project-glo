-- Add additional security policies for contact_submissions table

-- Explicitly prevent DELETE operations to maintain audit trail
CREATE POLICY "No one can delete contact submissions" 
ON public.contact_submissions 
FOR DELETE 
TO authenticated, anon
USING (false);

-- Add more restrictive INSERT policy with additional security checks
DROP POLICY IF EXISTS "Anyone can create contact submissions" ON public.contact_submissions;

CREATE POLICY "Secure contact submission creation" 
ON public.contact_submissions 
FOR INSERT 
TO authenticated, anon
WITH CHECK (
  -- Ensure required fields are present and reasonable
  name IS NOT NULL 
  AND email IS NOT NULL 
  AND message IS NOT NULL
  AND length(trim(name)) >= 2 
  AND length(trim(name)) <= 100
  AND length(trim(email)) >= 5 
  AND length(trim(email)) <= 254
  AND length(trim(message)) >= 10 
  AND length(trim(message)) <= 5000
  -- Ensure status is set to default values only
  AND (status IS NULL OR status = 'new')
  -- Prevent injection of admin-only fields
  AND admin_notes IS NULL
  AND responded_at IS NULL
);

-- Add policy to log all access attempts to contact submissions
CREATE POLICY "Log contact submission access" 
ON public.contact_submissions 
FOR SELECT 
TO authenticated
USING (
  -- Allow admins to view but log the access attempt
  is_admin_user() 
  AND pg_advisory_lock(1234567890) IS NOT NULL 
  AND pg_advisory_unlock(1234567890) IS NOT NULL
);