-- Update RLS policies for donations table to allow public donations
DROP POLICY IF EXISTS "Only admins can insert donations" ON public.donations;
DROP POLICY IF EXISTS "Only admins can view donations" ON public.donations;

-- Allow anyone to create donations
CREATE POLICY "Anyone can create donations" 
ON public.donations 
FOR INSERT 
WITH CHECK (true);

-- Keep admin view policy for management
CREATE POLICY "Admins can view donations" 
ON public.donations 
FOR SELECT 
USING (public.is_admin_user());