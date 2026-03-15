-- Drop and recreate the admin update policy with explicit with_check
DROP POLICY IF EXISTS "Admins can update partner applications" ON public.partner_applications;
CREATE POLICY "Admins can update partner applications"
  ON public.partner_applications
  FOR UPDATE
  TO authenticated
  USING (public.is_admin_user())
  WITH CHECK (public.is_admin_user());

-- Also ensure admins can INSERT into organizations (the ALL policy should cover this, but let's be explicit)
DROP POLICY IF EXISTS "Admins can insert organizations" ON public.organizations;
CREATE POLICY "Admins can insert organizations"
  ON public.organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_user() OR (owner_user_id = auth.uid()));