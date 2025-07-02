
-- Create services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  key_features JSONB,
  availability TEXT DEFAULT 'Available',
  priority_level TEXT DEFAULT 'Medium',
  language_support TEXT DEFAULT 'English',
  category TEXT NOT NULL,
  contact_phone TEXT,
  contact_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Public read access for services (needed for chatbot functionality)
CREATE POLICY "Anyone can view available services" ON public.services
  FOR SELECT TO authenticated, anon
  USING (availability = 'Available');

-- Admin policy for managing services
CREATE POLICY "Admins can manage services" ON public.services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Create support_requests table
CREATE TABLE public.support_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT,
  service_type TEXT,
  language TEXT DEFAULT 'english',
  priority TEXT DEFAULT 'medium',
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on support_requests
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

-- Policy for creating support requests
CREATE POLICY "Anyone can create support requests" ON public.support_requests
  FOR INSERT TO authenticated, anon
  WITH CHECK (true);

-- Admin policy for viewing support requests
CREATE POLICY "Admins can view all support requests" ON public.support_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Add matched_service column to chat_interactions
ALTER TABLE public.chat_interactions 
ADD COLUMN matched_service TEXT;

-- Insert sample services data
INSERT INTO public.services (title, description, key_features, availability, priority_level, language_support, category, contact_phone, contact_url) VALUES
('Emergency Shelter', 'Immediate safe housing and emergency accommodation for women and children in need.', '["24/7 availability", "Safe environment", "Temporary housing", "Crisis intervention"]', 'Available', 'Urgent', 'English, Swahili', 'Emergency', '1-800-GLO-HELP', 'https://glo.org/services/shelter'),
('Food Assistance', 'Nutritious meals and food packages for families in need.', '["Daily meals", "Food packages", "Nutritional support", "Family-friendly"]', 'Available', 'High', 'English, Swahili', 'Basic Needs', '1-800-GLO-FOOD', 'https://glo.org/services/food'),
('Healthcare Services', 'Medical care, prenatal services, and health support for women and children.', '["Medical checkups", "Prenatal care", "Child health", "Mental health support"]', 'Available', 'High', 'English, Swahili, Arabic', 'Healthcare', '1-800-GLO-CARE', 'https://glo.org/services/health'),
('Legal Aid', 'Legal assistance and advocacy for women facing domestic violence or legal challenges.', '["Legal consultation", "Court support", "Documentation help", "Advocacy services"]', 'Available', 'Medium', 'English, Swahili', 'Legal', '1-800-GLO-LEGAL', 'https://glo.org/services/legal'),
('Job Training', 'Skills development and employment assistance programs.', '["Skill training", "Job placement", "Career counseling", "Business support"]', 'Available', 'Medium', 'English, Swahili', 'Employment', '1-800-GLO-WORK', 'https://glo.org/services/jobs');
