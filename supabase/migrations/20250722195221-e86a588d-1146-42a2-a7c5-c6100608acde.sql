
-- Fix the typo in the admin email address
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  -- Direct check against auth.uid() without referencing profiles table
  -- Fixed typo: msmasandadinah@gmail.com (not msmsasandadinah@gmail.com)
  RETURN auth.uid() IN (
    SELECT au.id 
    FROM auth.users au 
    WHERE au.email IN ('msmasandadinah@gmail.com', 'projectglo2024@gmail.com')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
