
-- Create user_assessments table to track assessment data
CREATE TABLE public.user_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  assessment_number INTEGER NOT NULL, -- Track which assessment this is (1, 2, 3, etc.)
  need_types TEXT[] NOT NULL, -- Array of needs: shelter, mental_health, food, legal_aid, childcare
  urgency_level TEXT NOT NULL CHECK (urgency_level IN ('high', 'medium', 'low')),
  language_preference TEXT NOT NULL,
  location_data JSONB, -- Store location information
  vulnerability_tags TEXT[], -- Array of tags: gbv_survivor, pregnant, teen_mother, minor
  literacy_mode TEXT CHECK (literacy_mode IN ('text', 'voice_first', 'icon_based')),
  assessment_responses JSONB NOT NULL, -- Store full assessment responses
  is_emergency BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create service_providers table
CREATE TABLE public.service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name TEXT NOT NULL,
  service_types TEXT[] NOT NULL, -- Types of services offered
  location_data JSONB NOT NULL, -- Location information including coordinates
  languages_supported TEXT[] NOT NULL,
  vulnerability_specializations TEXT[], -- Which vulnerability tags they specialize in
  capacity_info JSONB, -- Current capacity, max capacity, etc.
  contact_info JSONB NOT NULL, -- Phone, email, address
  operating_hours JSONB,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('verified', 'pending', 'rejected')),
  emergency_services BOOLEAN DEFAULT FALSE, -- Can handle emergency cases
  created_by UUID REFERENCES public.profiles(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create match_logs table to track matching history
CREATE TABLE public.match_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES public.service_providers(id) NOT NULL,
  assessment_id UUID REFERENCES public.user_assessments(id) NOT NULL,
  match_score DECIMAL NOT NULL, -- Calculated match score (0-100)
  match_criteria JSONB NOT NULL, -- Detailed breakdown of how match was calculated
  match_type TEXT NOT NULL CHECK (match_type IN ('emergency', 'standard', 'follow_up')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
  provider_response TEXT,
  user_feedback JSONB,
  matched_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Enable RLS on all tables
ALTER TABLE public.user_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_assessments
CREATE POLICY "Users can view their own assessments" ON public.user_assessments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own assessments" ON public.user_assessments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all assessments" ON public.user_assessments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin')
  );

-- RLS Policies for service_providers
CREATE POLICY "Anyone can view verified providers" ON public.service_providers
  FOR SELECT USING (verification_status = 'verified' AND is_active = true);

CREATE POLICY "NGOs can manage their own provider profiles" ON public.service_providers
  FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Admins can manage all providers" ON public.service_providers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin')
  );

-- RLS Policies for match_logs
CREATE POLICY "Users can view their own matches" ON public.match_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service providers can view matches assigned to them" ON public.match_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.service_providers WHERE id = provider_id AND created_by = auth.uid())
  );

CREATE POLICY "Service providers can update their match responses" ON public.match_logs
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.service_providers WHERE id = provider_id AND created_by = auth.uid())
  );

CREATE POLICY "System can create matches" ON public.match_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all matches" ON public.match_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'admin')
  );

-- Create indexes for better performance
CREATE INDEX idx_user_assessments_user_id ON public.user_assessments(user_id);
CREATE INDEX idx_user_assessments_urgency ON public.user_assessments(urgency_level);
CREATE INDEX idx_service_providers_location ON public.service_providers USING GIN(location_data);
CREATE INDEX idx_service_providers_service_types ON public.service_providers USING GIN(service_types);
CREATE INDEX idx_match_logs_user_provider ON public.match_logs(user_id, provider_id);
CREATE INDEX idx_match_logs_status ON public.match_logs(status);

-- Insert sample service providers
INSERT INTO public.service_providers (provider_name, service_types, location_data, languages_supported, vulnerability_specializations, contact_info, emergency_services, verification_status) VALUES
('Safe Haven Shelter', 
 ARRAY['shelter', 'emergency_housing'], 
 '{"address": "Nairobi Central", "coordinates": {"lat": -1.2921, "lng": 36.8219}, "region": "Nairobi"}',
 ARRAY['english', 'swahili', 'sheng'],
 ARRAY['gbv_survivor', 'pregnant', 'teen_mother'],
 '{"phone": "+254700123456", "email": "contact@safehaven.org", "address": "123 Safety Street, Nairobi"}',
 true,
 'verified'),

('Mama Care Center',
 ARRAY['mental_health', 'childcare', 'counseling'],
 '{"address": "Mombasa", "coordinates": {"lat": -4.0435, "lng": 39.6682}, "region": "Mombasa"}',
 ARRAY['swahili', 'arabic', 'english'],
 ARRAY['teen_mother', 'minor', 'gbv_survivor'],
 '{"phone": "+254722987654", "email": "help@mamacare.org", "address": "456 Care Avenue, Mombasa"}',
 false,
 'verified'),

('Legal Aid Kenya',
 ARRAY['legal_aid', 'rights_advocacy'],
 '{"address": "Kisumu", "coordinates": {"lat": -0.0917, "lng": 34.7680}, "region": "Kisumu"}',
 ARRAY['english', 'swahili', 'sheng'],
 ARRAY['gbv_survivor'],
 '{"phone": "+254733456789", "email": "support@legalaidkenya.org", "address": "789 Justice Road, Kisumu"}',
 true,
 'verified');
