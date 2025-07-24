
-- Create contact_submissions table to store all contact form submissions
CREATE TABLE public.contact_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  ip_address TEXT,
  user_agent TEXT
);

-- Add Row Level Security (RLS) to protect contact submissions
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy that allows admins to view all contact submissions
CREATE POLICY "Admins can view all contact submissions" 
  ON public.contact_submissions 
  FOR SELECT 
  USING (is_admin_user());

-- Create policy that allows admins to update contact submissions
CREATE POLICY "Admins can update contact submissions" 
  ON public.contact_submissions 
  FOR UPDATE 
  USING (is_admin_user());

-- Create policy that allows anyone to create contact submissions
CREATE POLICY "Anyone can create contact submissions" 
  ON public.contact_submissions 
  FOR INSERT 
  WITH CHECK (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_contact_submission_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER update_contact_submissions_updated_at
  BEFORE UPDATE ON public.contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_contact_submission_timestamp();

-- Create index for better query performance
CREATE INDEX idx_contact_submissions_status ON public.contact_submissions(status);
CREATE INDEX idx_contact_submissions_created_at ON public.contact_submissions(created_at DESC);
