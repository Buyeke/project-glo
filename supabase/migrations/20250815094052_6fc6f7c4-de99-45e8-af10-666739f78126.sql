
-- Fix database function search path vulnerabilities
-- This prevents potential SQL injection and privilege escalation attacks

-- Update update_site_content_timestamp function
CREATE OR REPLACE FUNCTION public.update_site_content_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$function$;

-- Update update_contact_submission_timestamp function
CREATE OR REPLACE FUNCTION public.update_contact_submission_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    -- Use fully qualified table names
    UPDATE public.contacts 
    SET last_submission_timestamp = NOW()
    WHERE id = NEW.contact_id;
    
    RETURN NEW;
END;
$function$;

-- Update update_applicant_count function
CREATE OR REPLACE FUNCTION public.update_applicant_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  UPDATE public.job_postings 
  SET applicant_count = applicant_count + 1
  WHERE id = NEW.job_posting_id;
  RETURN NEW;
END;
$function$;

-- Update expire_old_jobs function
CREATE OR REPLACE FUNCTION public.expire_old_jobs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  UPDATE public.job_postings
  SET status = 'expired'
  WHERE status = 'active' AND expires_at < now();
END;
$function$;

-- Update validate_contact_submission function
CREATE OR REPLACE FUNCTION public.validate_contact_submission(p_name text, p_email text, p_message text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
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
$function$;

-- Update setup_admin_user function
CREATE OR REPLACE FUNCTION public.setup_admin_user(user_email text, user_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  user_id_var uuid;
BEGIN
  -- Get the user ID from the email
  SELECT id INTO user_id_var FROM auth.users WHERE email = user_email;
  
  IF user_id_var IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Create or update profile
  INSERT INTO public.profiles (id, full_name, user_type)
  VALUES (user_id_var, user_name, 'admin')
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    user_type = EXCLUDED.user_type;
  
  -- Add to team_members with admin role
  INSERT INTO public.team_members (user_id, role, verified, department)
  VALUES (user_id_var, 'admin', true, 'Executive')
  ON CONFLICT (user_id, role) DO UPDATE SET
    verified = EXCLUDED.verified,
    department = EXCLUDED.department;
END;
$function$;

-- Update verify_admin_setup function
CREATE OR REPLACE FUNCTION public.verify_admin_setup()
RETURNS TABLE(email text, user_id uuid, profile_exists boolean, is_admin boolean, email_confirmed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    u.email::text,
    u.id::uuid,
    (p.id IS NOT NULL)::boolean as profile_exists,
    (tm.role = 'admin' AND tm.verified = true)::boolean as is_admin,
    (u.email_confirmed_at IS NOT NULL)::boolean as email_confirmed
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id
  LEFT JOIN public.team_members tm ON u.id = tm.user_id AND tm.role = 'admin'
  WHERE u.email IN ('founder@projectglo.org', 'projectglo2024@gmail.com');
END;
$function$;

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
    INSERT INTO public.profiles (id, full_name, user_type)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'individual');
    RETURN NEW;
END;
$function$;

-- Update update_response_times function
CREATE OR REPLACE FUNCTION public.update_response_times()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  IF OLD.status != 'responded' AND NEW.status = 'responded' THEN
    NEW.responded_at = now();
    NEW.response_time_hours = EXTRACT(EPOCH FROM (now() - NEW.submitted_at)) / 3600;
  END IF;
  
  IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
    NEW.completed_at = now();
    NEW.completion_time_hours = EXTRACT(EPOCH FROM (now() - NEW.submitted_at)) / 3600;
  END IF;
  
  RETURN NEW;
END;
$function$;
