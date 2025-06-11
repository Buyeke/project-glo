
-- Create user profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  age INTEGER,
  location TEXT,
  phone TEXT,
  user_type TEXT CHECK (user_type IN ('individual', 'ngo', 'admin')) NOT NULL DEFAULT 'individual',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user needs table for individuals
CREATE TABLE public.user_needs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  need_type TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('pending', 'in_progress', 'fulfilled', 'closed')) DEFAULT 'pending',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create NGO details table
CREATE TABLE public.ngo_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_name TEXT NOT NULL,
  registration_number TEXT,
  services_offered TEXT[], -- Array of services
  capacity INTEGER,
  location TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  description TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create service requests table
CREATE TABLE public.service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ngo_id UUID REFERENCES public.ngo_details(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'declined')) DEFAULT 'pending',
  message TEXT,
  response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create resources table
CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  summary TEXT,
  description TEXT,
  file_url TEXT,
  contact_info TEXT,
  location TEXT,
  service_type TEXT,
  created_by UUID REFERENCES public.profiles(id),
  published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create blog posts table
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  thumbnail_url TEXT,
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create donations table
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_email TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT DEFAULT 'paypal',
  payment_id TEXT,
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
  donor_name TEXT,
  message TEXT,
  anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table for communication
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_needs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ngo_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can insert profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for user_needs
CREATE POLICY "Users can manage their own needs" ON public.user_needs
  FOR ALL USING (user_id = auth.uid());

-- Create RLS policies for ngo_details
CREATE POLICY "NGOs can manage their own details" ON public.ngo_details
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Anyone can view verified NGOs" ON public.ngo_details
  FOR SELECT USING (verified = TRUE);

-- Create RLS policies for service_requests
CREATE POLICY "Users can view their own requests" ON public.service_requests
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "NGOs can view requests for their services" ON public.service_requests
  FOR SELECT USING (ngo_id IN (SELECT id FROM public.ngo_details WHERE user_id = auth.uid()));

CREATE POLICY "Users can create service requests" ON public.service_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "NGOs can update their service requests" ON public.service_requests
  FOR UPDATE USING (ngo_id IN (SELECT id FROM public.ngo_details WHERE user_id = auth.uid()));

-- Create RLS policies for resources
CREATE POLICY "Anyone can view published resources" ON public.resources
  FOR SELECT USING (published = TRUE);

-- Create RLS policies for blog_posts
CREATE POLICY "Anyone can view published blog posts" ON public.blog_posts
  FOR SELECT USING (published = TRUE);

-- Create RLS policies for messages
CREATE POLICY "Users can view their own messages" ON public.messages
  FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'individual')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample blog posts
INSERT INTO public.blog_posts (title, slug, excerpt, content, published, published_at) VALUES
('Glo Receives Seed Funding', 'glo-receives-seed-funding', 'We are excited to announce that Glo has received seed funding to support homeless women and children.', 'We are thrilled to share that Glo has secured seed funding to advance our mission of supporting homeless women and children through AI-powered social platforms. This funding will enable us to expand our services and reach more vulnerable communities.', TRUE, '2024-11-01'),
('Prototype Development Begins', 'prototype-development-begins', 'Our development team has started building the first prototype of the Glo platform.', 'After months of planning and research, we have officially begun the development of our prototype. Our team is working tirelessly to create a platform that will truly make a difference in the lives of homeless women and children.', TRUE, '2024-12-01'),
('MVP Launched for Testing', 'mvp-launched-for-testing', 'The minimum viable product of Glo is now live and available for community testing.', 'We are proud to announce the launch of our MVP! This milestone represents countless hours of dedication from our team and valuable feedback from the community. The platform is now available for testing by our partner organizations.', TRUE, '2025-02-01'),
('First Impact Report Released', 'first-impact-report-released', 'Our first quarterly impact report shows promising results in connecting women with essential services.', 'Today we released our first impact report, highlighting the positive outcomes we have achieved in our initial months of operation. The data shows successful connections between service seekers and providers, with measurable improvements in housing stability and access to healthcare.', TRUE, '2025-03-01'),
('Runner-up at Innovation Week', 'runner-up-innovation-week', 'Glo wins runner-up position at The Co-operative University Innovation Week competition.', 'We are honored to have been selected as runner-up at The Co-operative University Innovation Week! This recognition validates our approach to addressing homelessness through technology and community partnerships. We are grateful for this opportunity to showcase our work.', TRUE, '2025-04-01'),
('Platform Migration and Improvements', 'platform-migration-improvements', 'Glo switches web hosting providers and addresses technical challenges to improve user experience.', 'As part of our commitment to providing the best possible service, we have migrated to a new web hosting provider. While this transition has presented some technical challenges, our team is working around the clock to resolve any issues and enhance the overall user experience.', TRUE, '2025-05-01');

-- Insert sample resources
INSERT INTO public.resources (title, category, summary, description, location, service_type, published) VALUES
('Legal Aid for Housing Rights', 'legal aid', 'Free legal assistance for housing-related issues', 'Comprehensive legal support for tenants facing eviction, housing discrimination, or unsafe living conditions. Services include consultation, representation, and advocacy.', 'Nairobi', 'legal consultation', TRUE),
('Mental Health Support Groups', 'mental health', 'Weekly support groups for trauma recovery', 'Peer-led support groups providing a safe space for sharing experiences and healing from trauma. Led by trained facilitators with lived experience.', 'Nairobi', 'counseling', TRUE),
('Job Training Program', 'employment', 'Skills training for sustainable employment', 'Comprehensive job training program covering digital literacy, vocational skills, and job placement assistance. Includes mentorship and follow-up support.', 'Nairobi', 'training', TRUE),
('Healthcare Access Program', 'health & wellness', 'Primary healthcare and wellness services', 'Basic healthcare services including check-ups, maternal health, and wellness education. Mobile clinic services available for hard-to-reach areas.', 'Nairobi', 'healthcare', TRUE),
('Educational Support for Children', 'education', 'School enrollment and educational support', 'Assistance with school enrollment, provision of educational materials, and tutoring support for children of homeless families.', 'Nairobi', 'education', TRUE),
('Financial Literacy Workshops', 'education', 'Basic financial management and savings', 'Interactive workshops covering budgeting, saving, and financial planning. Includes practical tools and ongoing support for implementing financial strategies.', 'Nairobi', 'training', TRUE);
