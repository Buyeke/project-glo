
-- Update the admin function to only include projectglo2024@gmail.com
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  -- Direct check against auth.uid() without referencing profiles table
  -- Only projectglo2024@gmail.com is now an admin
  RETURN auth.uid() IN (
    SELECT au.id 
    FROM auth.users au 
    WHERE au.email = 'projectglo2024@gmail.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
