
-- Unified audit trail table
CREATE TABLE public.audit_trail (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id text NOT NULL,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data jsonb,
  new_data jsonb,
  changed_fields text[],
  performed_by uuid,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_audit_trail_table_name ON public.audit_trail (table_name);
CREATE INDEX idx_audit_trail_created_at ON public.audit_trail (created_at DESC);
CREATE INDEX idx_audit_trail_performed_by ON public.audit_trail (performed_by);
CREATE INDEX idx_audit_trail_record_id ON public.audit_trail (record_id);

-- Enable RLS
ALTER TABLE public.audit_trail ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit trail
CREATE POLICY "Admins can view audit trail"
  ON public.audit_trail FOR SELECT
  USING (is_admin_user());

-- Service role / triggers can insert
CREATE POLICY "Service role can insert audit trail"
  ON public.audit_trail FOR INSERT
  WITH CHECK (true);

-- No one can update or delete audit records (immutable)
CREATE POLICY "No updates on audit trail"
  ON public.audit_trail FOR UPDATE
  USING (false);

CREATE POLICY "No deletes on audit trail"
  ON public.audit_trail FOR DELETE
  USING (false);

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  changed text[];
  col text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_trail (table_name, record_id, action, old_data, performed_by)
    VALUES (TG_TABLE_NAME, OLD.id::text, 'DELETE', to_jsonb(OLD), auth.uid());
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Calculate changed fields
    changed := ARRAY[]::text[];
    FOR col IN SELECT column_name FROM information_schema.columns 
               WHERE table_schema = TG_TABLE_SCHEMA AND table_name = TG_TABLE_NAME
    LOOP
      IF to_jsonb(NEW) -> col IS DISTINCT FROM to_jsonb(OLD) -> col THEN
        changed := array_append(changed, col);
      END IF;
    END LOOP;
    
    INSERT INTO public.audit_trail (table_name, record_id, action, old_data, new_data, changed_fields, performed_by)
    VALUES (TG_TABLE_NAME, NEW.id::text, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), changed, auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_trail (table_name, record_id, action, new_data, performed_by)
    VALUES (TG_TABLE_NAME, NEW.id::text, 'INSERT', to_jsonb(NEW), auth.uid());
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- Attach triggers to sensitive tables
CREATE TRIGGER audit_profiles
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_organizations
  AFTER INSERT OR UPDATE OR DELETE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_contact_submissions
  AFTER INSERT OR UPDATE OR DELETE ON public.contact_submissions
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_donations
  AFTER INSERT OR UPDATE OR DELETE ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_blog_posts
  AFTER INSERT OR UPDATE OR DELETE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_team_members
  AFTER INSERT OR UPDATE OR DELETE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_org_cases
  AFTER INSERT OR UPDATE OR DELETE ON public.org_cases
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
