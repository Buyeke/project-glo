
-- Create service_requests_tracking table for detailed tracking
CREATE TABLE public.service_requests_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  language_used TEXT CHECK (language_used IN ('english', 'swahili', 'arabic', 'sheng')) DEFAULT 'english',
  status TEXT CHECK (status IN ('submitted', 'in_progress', 'completed', 'cancelled')) DEFAULT 'submitted',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  response_time_hours DECIMAL,
  completion_time_hours DECIMAL,
  referral_made BOOLEAN DEFAULT FALSE,
  referral_successful BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_feedback table
CREATE TABLE public.user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_request_id UUID REFERENCES public.service_requests_tracking(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  feedback_type TEXT DEFAULT 'post_service',
  anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create usage_stats table for tracking user activity
CREATE TABLE public.usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'login', 'service_request', 'feedback_given', 'resource_viewed', etc.
  page_visited TEXT,
  session_duration_minutes INTEGER,
  language_preference TEXT,
  device_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create admin_reports table for storing generated reports
CREATE TABLE public.admin_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  report_date DATE NOT NULL,
  metrics JSONB NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  generated_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS on all new tables
ALTER TABLE public.service_requests_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies for service_requests_tracking
CREATE POLICY "Users can view their own service requests" ON public.service_requests_tracking
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own service requests" ON public.service_requests_tracking
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own service requests" ON public.service_requests_tracking
  FOR UPDATE USING (user_id = auth.uid());

-- RLS policies for user_feedback
CREATE POLICY "Users can view their own feedback" ON public.user_feedback
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own feedback" ON public.user_feedback
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS policies for usage_stats
CREATE POLICY "Users can view their own usage stats" ON public.usage_stats
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert usage stats" ON public.usage_stats
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admin policies (assuming admin role exists in profiles)
CREATE POLICY "Admins can view all service requests" ON public.service_requests_tracking
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Admins can view all feedback" ON public.user_feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Admins can view all usage stats" ON public.usage_stats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Admins can manage reports" ON public.admin_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Create function to calculate response times
CREATE OR REPLACE FUNCTION update_response_times()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate response time when status changes from 'submitted' to 'in_progress'
  IF OLD.status = 'submitted' AND NEW.status = 'in_progress' AND NEW.responded_at IS NOT NULL THEN
    NEW.response_time_hours = EXTRACT(EPOCH FROM (NEW.responded_at - NEW.submitted_at)) / 3600.0;
  END IF;
  
  -- Calculate completion time when status changes to 'completed'
  IF NEW.status = 'completed' AND NEW.completed_at IS NOT NULL THEN
    NEW.completion_time_hours = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.submitted_at)) / 3600.0;
  END IF;
  
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for response time calculation
CREATE TRIGGER update_service_request_times
  BEFORE UPDATE ON public.service_requests_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_response_times();

-- Insert sample data for testing
INSERT INTO public.service_requests_tracking (user_id, service_type, language_used, status, priority, submitted_at) 
SELECT 
  p.id,
  (ARRAY['shelter', 'legal aid', 'mental health', 'job placement', 'healthcare'])[floor(random() * 5 + 1)],
  (ARRAY['english', 'swahili', 'arabic', 'sheng'])[floor(random() * 4 + 1)],
  (ARRAY['submitted', 'in_progress', 'completed'])[floor(random() * 3 + 1)],
  (ARRAY['low', 'medium', 'high', 'urgent'])[floor(random() * 4 + 1)],
  NOW() - (random() * interval '30 days')
FROM public.profiles p 
WHERE p.user_type = 'individual' 
LIMIT 20;
