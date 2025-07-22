
-- Update user profiles to set admin status for the specified email addresses
-- First, we need to find the user IDs from the auth.users table and update the corresponding profiles

UPDATE public.profiles 
SET user_type = 'admin', updated_at = NOW()
WHERE id IN (
  SELECT au.id 
  FROM auth.users au 
  WHERE au.email IN ('msmsasandadinah@gmail.com', 'projectglo2024@gmail.com')
);

-- If the profiles don't exist yet (users haven't signed up), we'll need to wait for them to sign up first
-- The trigger will create their profile, then this update can be run again
