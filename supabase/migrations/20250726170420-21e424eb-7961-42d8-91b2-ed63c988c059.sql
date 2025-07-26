
-- Create employer_profiles table for employer information
CREATE TABLE public.employer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  contact_person TEXT,
  phone_number TEXT,
  email TEXT,
  verified BOOLEAN DEFAULT false,
  verification_method TEXT, -- 'sms' or 'whatsapp'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create job_postings table
CREATE TABLE public.job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES public.employer_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  job_type TEXT NOT NULL, -- 'one-time', 'part-time', 'full-time'
  pay_amount DECIMAL NOT NULL,
  location TEXT NOT NULL,
  job_date DATE,
  job_time TIME,
  description TEXT NOT NULL,
  gender_preference TEXT, -- 'male', 'female', 'any'
  status TEXT DEFAULT 'draft', -- 'draft', 'pending_payment', 'active', 'expired'
  expires_at TIMESTAMPTZ,
  applicant_count INTEGER DEFAULT 0,
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  payment_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create job_payments table to track payments
CREATE TABLE public.job_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_posting_id UUID REFERENCES public.job_postings(id) ON DELETE CASCADE,
  employer_id UUID REFERENCES public.employer_profiles(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL,
  payment_method TEXT NOT NULL, -- 'mpesa', 'stripe'
  payment_reference TEXT,
  mpesa_checkout_id TEXT,
  stripe_payment_intent_id TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  is_renewal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create job_applicants table
CREATE TABLE public.job_applicants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_posting_id UUID REFERENCES public.job_postings(id) ON DELETE CASCADE,
  applicant_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  applicant_name TEXT NOT NULL,
  applicant_phone TEXT,
  applicant_email TEXT,
  cover_message TEXT,
  applied_at TIMESTAMPTZ DEFAULT now()
);

-- Create job_renewals table to track renewal history
CREATE TABLE public.job_renewals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_posting_id UUID REFERENCES public.job_postings(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES public.job_payments(id) ON DELETE CASCADE,
  renewed_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_renewals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employer_profiles
CREATE POLICY "Employers can view own profile" ON public.employer_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Employers can insert own profile" ON public.employer_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Employers can update own profile" ON public.employer_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all employer profiles" ON public.employer_profiles
  FOR ALL USING (is_admin_user());

-- RLS Policies for job_postings
CREATE POLICY "Employers can manage own job postings" ON public.job_postings
  FOR ALL USING (
    employer_id IN (
      SELECT id FROM public.employer_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view active job postings" ON public.job_postings
  FOR SELECT USING (status = 'active' AND expires_at > now());

CREATE POLICY "Admins can manage all job postings" ON public.job_postings
  FOR ALL USING (is_admin_user());

-- RLS Policies for job_payments
CREATE POLICY "Employers can view own payments" ON public.job_payments
  FOR SELECT USING (
    employer_id IN (
      SELECT id FROM public.employer_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Employers can insert own payments" ON public.job_payments
  FOR INSERT WITH CHECK (
    employer_id IN (
      SELECT id FROM public.employer_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can update payments" ON public.job_payments
  FOR UPDATE USING (true);

CREATE POLICY "Admins can manage all payments" ON public.job_payments
  FOR ALL USING (is_admin_user());

-- RLS Policies for job_applicants
CREATE POLICY "Anyone can apply to jobs" ON public.job_applicants
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Employers can view applicants for their jobs" ON public.job_applicants
  FOR SELECT USING (
    job_posting_id IN (
      SELECT jp.id FROM public.job_postings jp
      INNER JOIN public.employer_profiles ep ON jp.employer_id = ep.id
      WHERE ep.user_id = auth.uid()
    )
  );

CREATE POLICY "Applicants can view their own applications" ON public.job_applicants
  FOR SELECT USING (applicant_user_id = auth.uid());

CREATE POLICY "Admins can manage all applications" ON public.job_applicants
  FOR ALL USING (is_admin_user());

-- RLS Policies for job_renewals
CREATE POLICY "Employers can view own renewals" ON public.job_renewals
  FOR SELECT USING (
    job_posting_id IN (
      SELECT jp.id FROM public.job_postings jp
      INNER JOIN public.employer_profiles ep ON jp.employer_id = ep.id
      WHERE ep.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert renewals" ON public.job_renewals
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage all renewals" ON public.job_renewals
  FOR ALL USING (is_admin_user());

-- Create function to update applicant count
CREATE OR REPLACE FUNCTION update_applicant_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.job_postings 
  SET applicant_count = applicant_count + 1
  WHERE id = NEW.job_posting_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for applicant count
CREATE TRIGGER update_applicant_count_trigger
  AFTER INSERT ON public.job_applicants
  FOR EACH ROW EXECUTE FUNCTION update_applicant_count();

-- Create function to automatically expire jobs
CREATE OR REPLACE FUNCTION expire_old_jobs()
RETURNS void AS $$
BEGIN
  UPDATE public.job_postings
  SET status = 'expired'
  WHERE status = 'active' AND expires_at < now();
END;
$$ LANGUAGE plpgsql;
