
-- Fix over-permissive RLS policy on rate_limits table
DROP POLICY IF EXISTS "System can manage rate limits" ON public.rate_limits;

-- Create a more secure policy that only allows service role operations
-- (service role bypasses RLS, so this is for documentation and safety)
CREATE POLICY "Service role can manage rate limits" ON public.rate_limits
FOR ALL 
USING (false)  -- No direct client access
WITH CHECK (false);  -- No direct client access

-- The "Only admins can view rate limits" policy remains unchanged as it's secure
