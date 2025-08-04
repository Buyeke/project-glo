
-- Create site_content table to store all editable website content
CREATE TABLE public.site_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_key TEXT NOT NULL UNIQUE,
  content_value JSONB NOT NULL DEFAULT '{}',
  content_type TEXT NOT NULL DEFAULT 'text',
  section TEXT NOT NULL,
  description TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Add Row Level Security
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view published content" 
  ON public.site_content 
  FOR SELECT 
  USING (published = true);

CREATE POLICY "Admins can manage all content" 
  ON public.site_content 
  FOR ALL 
  USING (is_admin_user());

-- Insert default content from the existing website
INSERT INTO public.site_content (content_key, content_value, content_type, section, description) VALUES
-- Homepage stats
('stats_users_supported', '{"number": "50+", "label": "Women Supported"}', 'stat', 'homepage', 'Number of women supported statistic'),
('stats_children_helped', '{"number": "100+", "label": "Children Helped"}', 'stat', 'homepage', 'Number of children helped statistic'),
('stats_trusted_partners', '{"number": "12+", "label": "Trusted Partners"}', 'stat', 'homepage', 'Number of trusted partners statistic'),
('stats_ai_support', '{"number": "24/7", "label": "AI Support"}', 'stat', 'homepage', '24/7 AI support availability'),

-- Homepage hero content
('hero_title', '{"text": "Empowering Women & Children"}', 'text', 'homepage', 'Main hero title'),
('hero_subtitle', '{"text": "GLO is an AI-powered safety net for women and children—offering multilingual support, dignity, and hope."}', 'text', 'homepage', 'Hero subtitle description'),
('hero_location_info', '{"text": "Serving Mombasa County (In-person & Virtual Services Available)"}', 'text', 'homepage', 'Service location information'),
('hero_meeting_info', '{"text": "Once your registration is confirmed, we will send you a personalized virtual meeting link via email or WhatsApp within 24 hours."}', 'text', 'homepage', 'Meeting information'),

-- About section
('about_title', '{"text": "About GLO"}', 'text', 'about', 'About section title'),
('about_description', '{"text": "GLO is a project using AI to deliver trauma-informed care, housing, and support to women and children in need. We connect vulnerable individuals with trusted local organizations through intelligent matching and multilingual support."}', 'text', 'about', 'About GLO description'),

-- Team information
('founder_name', '{"text": "Dinah Buyeke Masanda"}', 'text', 'team', 'Founder name'),
('founder_title', '{"text": "Founder & Project Lead"}', 'text', 'team', 'Founder title'),
('founder_bio', '{"text": "Dinah Buyeke Masanda is the founder of Glo, an AI-powered platform connecting homeless women and children in Kenya to trauma-informed care and support services. She''s passionate about building inclusive, ethical technologies rooted in care and community. Her research interests include gendered power, digital equity, Afro-feminist urban design, and the intersection of AI and social justice. Dinah is also a poet, a mother, and a 2024 OBREAL & AAU Fellow, committed to reimagining how systems serve — and who they''re built for."}', 'text', 'team', 'Founder biography'),

-- Partnership information  
('partnership_university', '{"text": "The Co-operative University of Kenya"}', 'text', 'partnerships', 'University partnership'),
('partnership_obreal', '{"text": "OBREAL (Spain)"}', 'text', 'partnerships', 'OBREAL partnership'),
('partner_count', '{"text": "Trusted by 12+ local shelters"}', 'text', 'partnerships', 'Partner count display'),
('service_area', '{"text": "Serving Mombasa County and surrounding areas"}', 'text', 'partnerships', 'Service area description'),

-- Service information
('service_emergency_title', '{"text": "Emergency Shelter"}', 'text', 'services', 'Emergency shelter service title'),
('service_emergency_desc', '{"text": "Immediate safe housing and emergency accommodation"}', 'text', 'services', 'Emergency shelter description'),
('service_job_title', '{"text": "Job Placement"}', 'text', 'services', 'Job placement service title'),
('service_job_desc', '{"text": "Employment opportunities and career development"}', 'text', 'services', 'Job placement description'),
('service_mental_title', '{"text": "Mental Health Support"}', 'text', 'services', 'Mental health service title'),
('service_mental_desc', '{"text": "Counseling, therapy, and emotional wellbeing services"}', 'text', 'services', 'Mental health description'),
('service_ai_title', '{"text": "AI-Powered Guidance"}', 'text', 'services', 'AI service title'),
('service_ai_desc', '{"text": "24/7 intelligent assistance and resource matching"}', 'text', 'services', 'AI service description'),

-- CTA sections
('cta_primary_title', '{"text": "Ready to Get Started?"}', 'text', 'cta', 'Primary CTA title'),
('cta_primary_subtitle', '{"text": "Whether you need support or want to help others, we''re here for you."}', 'text', 'cta', 'Primary CTA subtitle'),
('cta_network_title', '{"text": "Are you a therapist, legal expert, or NGO who wants to help?"}', 'text', 'cta', 'Network CTA title');

-- Add trigger to update timestamp
CREATE OR REPLACE FUNCTION update_site_content_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER site_content_updated_at
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW
  EXECUTE FUNCTION update_site_content_timestamp();
