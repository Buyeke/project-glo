-- Fix contact submissions security issue
-- Remove the problematic duplicate check policy and implement server-side duplicate prevention

-- Create a secure function for duplicate checking that doesn't expose data
CREATE OR REPLACE FUNCTION public.check_duplicate_submission(
  p_submission_hash TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if a submission with this hash exists in the last 24 hours
  RETURN EXISTS (
    SELECT 1 
    FROM contact_submissions 
    WHERE submission_hash = p_submission_hash 
    AND created_at > (NOW() - INTERVAL '24 hours')
  );
END;
$$;

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION public.check_duplicate_submission(TEXT) TO authenticated, anon;