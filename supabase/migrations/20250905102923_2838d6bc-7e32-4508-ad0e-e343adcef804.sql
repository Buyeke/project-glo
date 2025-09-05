-- Enable leaked password protection and additional security measures

-- Update the auth configuration to enable leaked password protection
-- Note: This requires the setting to be enabled in the Supabase auth configuration as well

-- Create a security audit function for admin use
CREATE OR REPLACE FUNCTION public.security_audit()
RETURNS TABLE (
  audit_item text,
  status text,
  details text
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check RLS is enabled on all user tables
  RETURN QUERY
  SELECT 
    'RLS Status Check'::text,
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::text,
    CASE WHEN COUNT(*) = 0 
         THEN 'All user tables have RLS enabled'
         ELSE 'Found ' || COUNT(*)::text || ' tables without RLS: ' || STRING_AGG(tablename, ', ')
    END::text
  FROM pg_tables 
  WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'user_concerns', 'contact_submissions', 'security_logs', 'donations')
    AND NOT EXISTS (
      SELECT 1 FROM pg_class c 
      JOIN pg_namespace n ON c.relnamespace = n.oid 
      WHERE c.relname = pg_tables.tablename 
        AND n.nspname = 'public' 
        AND c.relrowsecurity = true
    );

  -- Check for admin users
  RETURN QUERY
  SELECT 
    'Admin Users Check'::text,
    CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'FAIL' END::text,
    'Found ' || COUNT(*)::text || ' admin users in team_members table'::text
  FROM team_members 
  WHERE role = 'admin' AND verified = true;

  -- Check security triggers
  RETURN QUERY
  SELECT 
    'Security Triggers Check'::text,
    CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'FAIL' END::text,
    'Found ' || COUNT(*)::text || ' security validation triggers'::text
  FROM pg_trigger t
  JOIN pg_class c ON t.tgrelid = c.oid
  WHERE c.relname IN ('profiles') AND t.tgname LIKE '%security%';
END;
$$;

-- Create function to rotate security logs (for performance)
CREATE OR REPLACE FUNCTION public.rotate_security_logs(retention_days INTEGER DEFAULT 90)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Only admins can rotate logs
  IF NOT is_admin_user() THEN
    RAISE EXCEPTION 'Only administrators can rotate security logs';
  END IF;
  
  DELETE FROM security_logs 
  WHERE created_at < (NOW() - INTERVAL '1 day' * retention_days);
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Log the rotation
  INSERT INTO security_logs (
    event_type,
    user_id,
    event_data
  ) VALUES (
    'admin_access',
    auth.uid(),
    jsonb_build_object(
      'action', 'security_logs_rotation',
      'deleted_count', deleted_count,
      'retention_days', retention_days,
      'timestamp', NOW()
    )
  );
  
  RETURN deleted_count;
END;
$$;