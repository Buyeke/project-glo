
-- Extend profiles table with new fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
ADD COLUMN IF NOT EXISTS id_type TEXT,
ADD COLUMN IF NOT EXISTS id_number TEXT,
ADD COLUMN IF NOT EXISTS support_stage TEXT DEFAULT 'initial',
ADD COLUMN IF NOT EXISTS visit_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS progress_notes JSONB DEFAULT '[]'::jsonb;

-- Create user_concerns table
CREATE TABLE IF NOT EXISTS public.user_concerns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  concern_type TEXT NOT NULL,
  description TEXT,
  assigned_caseworker UUID REFERENCES public.profiles(id),
  resolved BOOLEAN DEFAULT FALSE,
  date_logged TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create allocated_resources table
CREATE TABLE IF NOT EXISTS public.allocated_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE,
  allocated_by UUID REFERENCES public.profiles(id),
  allocated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'allocated',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create team_members table for role-based access
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('caseworker', 'admin', 'ngo_partner')),
  permissions JSONB DEFAULT '{}'::jsonb,
  verified BOOLEAN DEFAULT FALSE,
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  caseworker_id UUID REFERENCES public.profiles(id),
  service_type TEXT NOT NULL,
  appointment_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  google_calendar_event_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create progress_notes table
CREATE TABLE IF NOT EXISTS public.progress_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  caseworker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'daily', 'weekly', 'monthly')),
  content TEXT NOT NULL,
  visibility TEXT DEFAULT 'team' CHECK (visibility IN ('private', 'team', 'public')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.user_concerns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allocated_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_notes ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_concerns
CREATE POLICY "Users can view their own concerns" ON public.user_concerns
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own concerns" ON public.user_concerns
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Caseworkers can view assigned concerns" ON public.user_concerns
  FOR SELECT USING (
    assigned_caseworker = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.team_members WHERE user_id = auth.uid() AND role IN ('admin', 'caseworker'))
  );

CREATE POLICY "Caseworkers can update assigned concerns" ON public.user_concerns
  FOR UPDATE USING (
    assigned_caseworker = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.team_members WHERE user_id = auth.uid() AND role IN ('admin', 'caseworker'))
  );

-- RLS policies for allocated_resources
CREATE POLICY "Users can view their allocated resources" ON public.allocated_resources
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Team members can manage resource allocation" ON public.allocated_resources
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.team_members WHERE user_id = auth.uid() AND role IN ('admin', 'caseworker'))
  );

-- RLS policies for team_members
CREATE POLICY "Users can view their own team membership" ON public.team_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage team members" ON public.team_members
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.team_members WHERE user_id = auth.uid() AND role = 'admin')
  );

-- RLS policies for appointments
CREATE POLICY "Users can view their own appointments" ON public.appointments
  FOR SELECT USING (user_id = auth.uid() OR caseworker_id = auth.uid());

CREATE POLICY "Users can create their own appointments" ON public.appointments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Caseworkers can manage their appointments" ON public.appointments
  FOR ALL USING (
    caseworker_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.team_members WHERE user_id = auth.uid() AND role IN ('admin', 'caseworker'))
  );

-- RLS policies for progress_notes
CREATE POLICY "Users can view their own progress notes" ON public.progress_notes
  FOR SELECT USING (
    user_id = auth.uid() OR 
    caseworker_id = auth.uid() OR
    (visibility = 'public' AND user_id = auth.uid())
  );

CREATE POLICY "Caseworkers can create progress notes" ON public.progress_notes
  FOR INSERT WITH CHECK (
    caseworker_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.team_members WHERE user_id = auth.uid() AND role IN ('admin', 'caseworker'))
  );

CREATE POLICY "Caseworkers can update their own progress notes" ON public.progress_notes
  FOR UPDATE USING (
    caseworker_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.team_members WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_concerns_user_id ON public.user_concerns(user_id);
CREATE INDEX IF NOT EXISTS idx_user_concerns_caseworker ON public.user_concerns(assigned_caseworker);
CREATE INDEX IF NOT EXISTS idx_allocated_resources_user_id ON public.allocated_resources(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_caseworker_id ON public.appointments(caseworker_id);
CREATE INDEX IF NOT EXISTS idx_progress_notes_user_id ON public.progress_notes(user_id);
