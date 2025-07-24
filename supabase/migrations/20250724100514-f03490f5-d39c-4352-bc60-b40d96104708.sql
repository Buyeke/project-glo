
-- Fix the is_admin_user function to properly check admin roles
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if user is admin in team_members table
  RETURN EXISTS (
    SELECT 1 
    FROM public.team_members 
    WHERE user_id = auth.uid() 
      AND role = 'admin' 
      AND verified = true
  );
END;
$$;

-- Add proper RLS policies to donations table
CREATE POLICY "Only admins can view donations"
  ON public.donations
  FOR SELECT
  USING (public.is_admin_user());

CREATE POLICY "Only admins can insert donations"
  ON public.donations
  FOR INSERT
  WITH CHECK (public.is_admin_user());

CREATE POLICY "Only admins can update donations"
  ON public.donations
  FOR UPDATE
  USING (public.is_admin_user());

CREATE POLICY "Only admins can delete donations"
  ON public.donations
  FOR DELETE
  USING (public.is_admin_user());

-- Add input validation function for contact submissions
CREATE OR REPLACE FUNCTION public.validate_contact_submission(
  p_name text,
  p_email text,
  p_message text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Validate name (2-100 characters, no HTML tags)
  IF p_name IS NULL OR 
     length(trim(p_name)) < 2 OR 
     length(trim(p_name)) > 100 OR
     p_name ~ '<[^>]*>' THEN
    RETURN false;
  END IF;

  -- Validate email format
  IF p_email IS NULL OR 
     NOT p_email ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' OR
     length(p_email) > 254 THEN
    RETURN false;
  END IF;

  -- Validate message (10-5000 characters, no excessive HTML)
  IF p_message IS NULL OR 
     length(trim(p_message)) < 10 OR 
     length(trim(p_message)) > 5000 THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$;

-- Add security logging table
CREATE TABLE IF NOT EXISTS public.security_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  event_type text NOT NULL,
  event_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on security_logs
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view security logs
CREATE POLICY "Only admins can view security logs"
  ON public.security_logs
  FOR SELECT
  USING (public.is_admin_user());

-- System can insert security logs
CREATE POLICY "System can insert security logs"
  ON public.security_logs
  FOR INSERT
  WITH CHECK (true);

-- Add rate limiting table for contact submissions
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier text NOT NULL, -- IP address or user_id
  action_type text NOT NULL,
  attempt_count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  blocked_until timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on rate_limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only admins can view rate limits
CREATE POLICY "Only admins can view rate limits"
  ON public.rate_limits
  FOR SELECT
  USING (public.is_admin_user());

-- System can manage rate limits
CREATE POLICY "System can manage rate limits"
  ON public.rate_limits
  FOR ALL
  WITH CHECK (true);

-- Add constraint to contact_submissions to use validation
ALTER TABLE public.contact_submissions 
ADD CONSTRAINT valid_contact_submission 
CHECK (public.validate_contact_submission(name, email, message));

-- Update contact_submissions to add rate limiting info
ALTER TABLE public.contact_submissions 
ADD COLUMN IF NOT EXISTS submission_hash text,
ADD COLUMN IF NOT EXISTS rate_limit_passed boolean DEFAULT true;
