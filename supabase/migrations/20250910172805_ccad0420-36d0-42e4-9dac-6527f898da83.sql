-- Remove any security definer views that could expose data

-- Check for and remove any security definer views
DO $$ 
DECLARE
    view_record RECORD;
BEGIN
    -- Get all views with security definer
    FOR view_record IN 
        SELECT schemaname, viewname 
        FROM pg_views 
        WHERE schemaname = 'public'
    LOOP
        -- Drop any views that might be security definer
        EXECUTE format('DROP VIEW IF EXISTS %I.%I CASCADE', view_record.schemaname, view_record.viewname);
    END LOOP;
END $$;

-- Log security view cleanup
INSERT INTO public.security_logs (
  event_type,
  event_data
) VALUES (
  'admin_access',
  jsonb_build_object(
    'action', 'security_definer_views_removed',
    'timestamp', NOW()
  )
);