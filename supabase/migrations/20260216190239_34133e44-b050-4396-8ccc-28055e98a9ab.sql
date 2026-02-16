
-- Fix overly permissive RLS policy on job_payments
-- The "Service role can update payments" policy uses USING(true) which allows any user to update
DROP POLICY IF EXISTS "Service role can update payments" ON public.job_payments;

-- Recreate with proper restriction - only admins or the employer who owns the payment
CREATE POLICY "Admins can update payments"
ON public.job_payments
FOR UPDATE
USING (is_admin_user());

-- Fix overly permissive RLS policy on job_renewals  
-- The "Service role can insert renewals" policy uses WITH CHECK(true) which allows any user to insert
DROP POLICY IF EXISTS "Service role can insert renewals" ON public.job_renewals;

-- Recreate with proper restriction - only admins can insert renewals
CREATE POLICY "Admins can insert renewals"
ON public.job_renewals
FOR INSERT
WITH CHECK (is_admin_user());
