-- Add status column to organizations for suspend/archive management
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active'
CHECK (status IN ('active', 'suspended', 'archived'));