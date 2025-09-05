-- Fix critical privilege escalation vulnerability in profiles table
-- Prevent users from setting user_type to 'admin' without proper authorization

-- Create function to validate user_type changes
CREATE OR REPLACE FUNCTION public.validate_user_type_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow admins to change any user_type
  IF is_admin_user() THEN
    RETURN NEW;
  END IF;
  
  -- For non-admins, prevent changing user_type to 'admin'
  IF NEW.user_type = 'admin' AND (OLD.user_type IS NULL OR OLD.user_type != 'admin') THEN
    RAISE EXCEPTION 'Only administrators can assign admin user type';
  END IF;
  
  -- Prevent non-admins from changing existing admin user_type
  IF OLD.user_type = 'admin' AND NEW.user_type != 'admin' THEN
    RAISE EXCEPTION 'Only administrators can modify admin user type';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to validate user_type changes
DROP TRIGGER IF EXISTS validate_user_type_trigger ON public.profiles;
CREATE TRIGGER validate_user_type_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_user_type_change();

-- Fix ngo_details table RLS policies
ALTER TABLE public.ngo_details ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Admins can manage ngo details" ON public.ngo_details;
DROP POLICY IF EXISTS "NGOs can view own details" ON public.ngo_details;
DROP POLICY IF EXISTS "Public can view verified NGO details" ON public.ngo_details;

-- Create secure RLS policies for ngo_details
CREATE POLICY "Admins can manage ngo details"
ON public.ngo_details
FOR ALL
USING (is_admin_user())
WITH CHECK (is_admin_user());

CREATE POLICY "NGOs can view own details"
ON public.ngo_details
FOR SELECT
USING (id IN (
  SELECT p.id 
  FROM public.profiles p 
  WHERE p.id = auth.uid() AND p.user_type = 'ngo'
));

CREATE POLICY "Public can view verified NGO details"
ON public.ngo_details
FOR SELECT
USING (verified = true);

-- Add security logging for privilege escalation attempts
CREATE OR REPLACE FUNCTION public.log_privilege_escalation_attempt()
RETURNS TRIGGER AS $$
BEGIN
  -- Log attempt to change user_type to admin
  IF NEW.user_type = 'admin' AND (OLD.user_type IS NULL OR OLD.user_type != 'admin') THEN
    INSERT INTO public.security_logs (
      event_type,
      user_id,
      event_data
    ) VALUES (
      'suspicious_activity',
      auth.uid(),
      jsonb_build_object(
        'action', 'privilege_escalation_attempt',
        'attempted_user_type', NEW.user_type,
        'previous_user_type', OLD.user_type,
        'target_user_id', NEW.id,
        'timestamp', now()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for security logging
DROP TRIGGER IF EXISTS log_privilege_escalation_trigger ON public.profiles;
CREATE TRIGGER log_privilege_escalation_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_privilege_escalation_attempt();