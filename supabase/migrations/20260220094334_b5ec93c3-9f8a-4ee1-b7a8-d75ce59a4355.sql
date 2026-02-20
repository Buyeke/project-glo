
-- Add payment and sending tracking to partner_invoices
ALTER TABLE public.partner_invoices
  ADD COLUMN IF NOT EXISTS payment_reference text,
  ADD COLUMN IF NOT EXISTS payment_url text,
  ADD COLUMN IF NOT EXISTS sent_at timestamp with time zone;
