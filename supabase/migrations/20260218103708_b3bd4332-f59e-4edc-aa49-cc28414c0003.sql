
-- Create partner_invoices table
CREATE TABLE public.partner_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  invoice_number text NOT NULL,
  billing_period_month integer NOT NULL CHECK (billing_period_month BETWEEN 1 AND 12),
  billing_period_year integer NOT NULL CHECK (billing_period_year BETWEEN 2020 AND 2050),
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  description text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date date,
  paid_at timestamptz,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partner_invoices ENABLE ROW LEVEL SECURITY;

-- Admin-only policies using existing is_admin_user() function
CREATE POLICY "Admins can manage partner invoices"
ON public.partner_invoices
FOR ALL
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Trigger for updated_at
CREATE TRIGGER update_partner_invoices_updated_at
BEFORE UPDATE ON public.partner_invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_site_content_timestamp();
