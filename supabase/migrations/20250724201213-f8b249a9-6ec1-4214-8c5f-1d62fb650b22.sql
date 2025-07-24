
-- Step 1: Clean up existing incomplete data
DELETE FROM public.team_members WHERE user_id IN (
  SELECT id FROM auth.users WHERE email IN ('founder@projectglo.org', 'projectglo2024@gmail.com')
);

DELETE FROM public.profiles WHERE id IN (
  SELECT id FROM auth.users WHERE email IN ('founder@projectglo.org', 'projectglo2024@gmail.com')
);

-- Step 2: Create a function to properly set up admin users after they're created
CREATE OR REPLACE FUNCTION public.setup_admin_user(user_email text, user_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Step 3: Create a function to verify admin setup
CREATE OR REPLACE FUNCTION public.verify_admin_setup()
RETURNS TABLE(
  email text,
  user_id uuid,
  profile_exists boolean,
  is_admin boolean,
  email_confirmed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.email,
    u.id,
    (p.id IS NOT NULL) as profile_exists,
    (tm.role = 'admin' AND tm.verified = true) as is_admin,
    (u.email_confirmed_at IS NOT NULL) as email_confirmed
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id
  LEFT JOIN public.team_members tm ON u.id = tm.user_id
  WHERE u.email IN ('founder@projectglo.org', 'projectglo2024@gmail.com');
END;
$$;
