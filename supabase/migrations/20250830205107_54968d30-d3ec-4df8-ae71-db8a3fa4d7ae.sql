
-- Security fixes: Harden RLS policies for critical tables

-- 1. Fix job_payments table - restrict UPDATE to service role only
DROP POLICY IF EXISTS "System can update payments" ON public.job_payments;

CREATE POLICY "Service role can update payments" 
ON public.job_payments 
FOR UPDATE 
TO service_role
USING (true);

-- 2. Fix job_renewals table - restrict INSERT to service role only  
DROP POLICY IF EXISTS "System can insert renewals" ON public.job_renewals;

CREATE POLICY "Service role can insert renewals" 
ON public.job_renewals 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- 3. Fix match_logs table - restrict INSERT to service role only
DROP POLICY IF EXISTS "System can create matches" ON public.match_logs;

CREATE POLICY "Service role can create matches" 
ON public.match_logs 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- 4. Ensure security_logs INSERT is restricted to authenticated users only
DROP POLICY IF EXISTS "System can insert security logs" ON public.security_logs;

CREATE POLICY "Authenticated users can insert security logs" 
ON public.security_logs 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- 5. Verify support_requests SELECT policy is secure (confirm existing policy)
-- The existing policy should already be: "Users can view their own support requests"
-- But let's ensure it's properly restrictive
DROP POLICY IF EXISTS "Users can view their own support requests" ON public.support_requests;

CREATE POLICY "Users can view own support requests" 
ON public.support_requests 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());
