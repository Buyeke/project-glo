-- Add user_id column to support_requests table for proper access control
ALTER TABLE public.support_requests 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for better performance on user queries
CREATE INDEX idx_support_requests_user_id ON public.support_requests(user_id);

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all support requests" ON public.support_requests;
DROP POLICY IF EXISTS "Anyone can create support requests" ON public.support_requests;

-- Create new RLS policies for better security
-- Allow users to view their own support requests (authenticated users only)
CREATE POLICY "Users can view their own support requests" 
ON public.support_requests 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Allow admins to view all support requests
CREATE POLICY "Admins can view all support requests" 
ON public.support_requests 
FOR SELECT 
TO authenticated
USING (is_admin_user());

-- Allow admins to update support requests (for status management)
CREATE POLICY "Admins can update support requests" 
ON public.support_requests 
FOR UPDATE 
TO authenticated
USING (is_admin_user());

-- Allow anyone to create support requests (but authenticated users must link to their ID)
CREATE POLICY "Anyone can create support requests" 
ON public.support_requests 
FOR INSERT 
TO anon, authenticated
WITH CHECK (
  -- Anonymous users: user_id must be null
  (auth.uid() IS NULL AND user_id IS NULL) 
  OR 
  -- Authenticated users: user_id must match their auth.uid()
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
);