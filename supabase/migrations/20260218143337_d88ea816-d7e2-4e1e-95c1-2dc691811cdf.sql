
-- Create partner_applications table for structured institution registration
CREATE TABLE public.partner_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name text NOT NULL,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  website text,
  institution_type text NOT NULL DEFAULT 'academic',
  description text,
  selected_tier text NOT NULL DEFAULT 'essentials',
  expected_student_count integer,
  payment_status text NOT NULL DEFAULT 'pending',
  payment_amount numeric,
  payment_due_date date,
  invoice_sent boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  admin_notes text,
  organization_id uuid REFERENCES public.organizations(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partner_applications ENABLE ROW LEVEL SECURITY;

-- Public can insert applications (unauthenticated users)
CREATE POLICY "Anyone can submit partner applications"
ON public.partner_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (
  organization_name IS NOT NULL
  AND contact_name IS NOT NULL
  AND contact_email IS NOT NULL
  AND length(trim(organization_name)) >= 2
  AND length(trim(contact_name)) >= 2
  AND length(trim(contact_email)) >= 5
  AND status = 'pending'
  AND reviewed_by IS NULL
  AND reviewed_at IS NULL
  AND admin_notes IS NULL
  AND organization_id IS NULL
);

-- Admins can read all applications
CREATE POLICY "Admins can view all partner applications"
ON public.partner_applications
FOR SELECT
TO authenticated
USING (is_admin_user());

-- Admins can update applications (approve/reject)
CREATE POLICY "Admins can update partner applications"
ON public.partner_applications
FOR UPDATE
TO authenticated
USING (is_admin_user());

-- No one can delete applications
CREATE POLICY "No one can delete partner applications"
ON public.partner_applications
FOR DELETE
USING (false);

-- Index for status filtering
CREATE INDEX idx_partner_applications_status ON public.partner_applications(status);
CREATE INDEX idx_partner_applications_email ON public.partner_applications(contact_email);

-- Ensure organizations.slug has a unique index (if not already)
CREATE UNIQUE INDEX IF NOT EXISTS idx_organizations_slug_unique ON public.organizations(slug);
