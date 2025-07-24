
-- Step 1: Add unique constraint to team_members table
ALTER TABLE public.team_members ADD CONSTRAINT team_members_user_role_unique UNIQUE (user_id, role);

-- Step 2: Fix the verify_admin_setup function with proper type casting
CREATE OR REPLACE FUNCTION public.verify_admin_setup()
RETURNS TABLE(email text, user_id uuid, profile_exists boolean, is_admin boolean, email_confirmed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Step 3: Manually confirm both admin emails and set up profiles
DO $$
DECLARE
  founder_id uuid;
  admin_id uuid;
BEGIN
  -- Get user IDs
  SELECT id INTO founder_id FROM auth.users WHERE email = 'founder@projectglo.org';
  SELECT id INTO admin_id FROM auth.users WHERE email = 'projectglo2024@gmail.com';
  
  -- Confirm founder email if user exists
  IF founder_id IS NOT NULL THEN
    UPDATE auth.users 
    SET email_confirmed_at = COALESCE(email_confirmed_at, now()), 
        updated_at = now() 
    WHERE id = founder_id;
    
    -- Set up founder profile
    INSERT INTO public.profiles (id, full_name, user_type)
    VALUES (founder_id, 'GLO Founder', 'admin')
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      user_type = EXCLUDED.user_type,
      updated_at = now();
      
    -- Add to team_members
    INSERT INTO public.team_members (user_id, role, verified, department)
    VALUES (founder_id, 'admin', true, 'Executive')
    ON CONFLICT (user_id, role) DO UPDATE SET
      verified = EXCLUDED.verified,
      department = EXCLUDED.department,
      updated_at = now();
  END IF;
  
  -- Confirm admin email if user exists
  IF admin_id IS NOT NULL THEN
    UPDATE auth.users 
    SET email_confirmed_at = COALESCE(email_confirmed_at, now()), 
        updated_at = now() 
    WHERE id = admin_id;
    
    -- Set up admin profile
    INSERT INTO public.profiles (id, full_name, user_type)
    VALUES (admin_id, 'GLO Admin', 'admin')
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      user_type = EXCLUDED.user_type,
      updated_at = now();
      
    -- Add to team_members
    INSERT INTO public.team_members (user_id, role, verified, department)
    VALUES (admin_id, 'admin', true, 'Executive')
    ON CONFLICT (user_id, role) DO UPDATE SET
      verified = EXCLUDED.verified,
      department = EXCLUDED.department,
      updated_at = now();
  END IF;
END $$;
