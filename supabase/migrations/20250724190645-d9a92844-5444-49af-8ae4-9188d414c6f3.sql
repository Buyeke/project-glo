
-- Create admin users in auth.users table
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_sent_at,
  confirmation_token,
  recovery_sent_at,
  recovery_token,
  email_change_sent_at,
  email_change,
  email_change_token_new,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  auth_session_limit,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  confirmed_at,
  email_change_token_current_deadline,
  email_change_token_new_deadline
) VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'founder@projectglo.org',
    crypt('GLOFounder2024!', gen_salt('bf')),
    now(),
    now(),
    '',
    NULL,
    '',
    NULL,
    '',
    '',
    '',
    0,
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "GLO Founder"}',
    false,
    now(),
    now(),
    NULL,
    NULL,
    '',
    '',
    NULL,
    now(),
    NULL,
    NULL
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'projectglo2024@gmail.com',
    crypt('GLOAdmin2024!', gen_salt('bf')),
    now(),
    now(),
    '',
    NULL,
    '',
    NULL,
    '',
    '',
    '',
    0,
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "GLO Admin"}',
    false,
    now(),
    now(),
    NULL,
    NULL,
    '',
    '',
    NULL,
    now(),
    NULL,
    NULL
  );

-- Create profiles for the admin users
INSERT INTO public.profiles (id, full_name, user_type)
SELECT 
  id,
  raw_user_meta_data->>'full_name',
  'admin'
FROM auth.users 
WHERE email IN ('founder@projectglo.org', 'projectglo2024@gmail.com');

-- Add admin roles to team_members table
INSERT INTO public.team_members (user_id, role, verified, department)
SELECT 
  id,
  'admin',
  true,
  'Executive'
FROM auth.users 
WHERE email IN ('founder@projectglo.org', 'projectglo2024@gmail.com');
