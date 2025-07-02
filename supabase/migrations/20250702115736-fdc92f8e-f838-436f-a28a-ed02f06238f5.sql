
-- Add location and delivery_mode to services table
ALTER TABLE public.services 
ADD COLUMN location TEXT DEFAULT 'Nairobi',
ADD COLUMN delivery_mode TEXT DEFAULT 'In-Person';

-- Create service_bookings table
CREATE TABLE public.service_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  service_title TEXT NOT NULL,
  booking_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique constraint to prevent duplicate bookings
CREATE UNIQUE INDEX unique_user_service_booking 
ON public.service_bookings (user_id, service_id, booking_date);

-- Enable RLS on service_bookings
ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;

-- Policies for service_bookings
CREATE POLICY "Users can view their own bookings" ON public.service_bookings
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own bookings" ON public.service_bookings
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own bookings" ON public.service_bookings
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all bookings" ON public.service_bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Create service_schedule table for rota
CREATE TABLE public.service_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  available_day TEXT NOT NULL CHECK (available_day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  available_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  max_bookings INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on service_schedule
ALTER TABLE public.service_schedule ENABLE ROW LEVEL SECURITY;

-- Policy for service_schedule
CREATE POLICY "Anyone can view service schedules" ON public.service_schedule
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Admins can manage service schedules" ON public.service_schedule
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Insert sample schedule data (twice weekly for each service)
INSERT INTO public.service_schedule (service_id, available_day, available_time, duration_minutes) 
SELECT id, 'Monday', '09:00:00', 120 FROM public.services WHERE title = 'Emergency Shelter'
UNION ALL
SELECT id, 'Thursday', '14:00:00', 120 FROM public.services WHERE title = 'Emergency Shelter'
UNION ALL
SELECT id, 'Tuesday', '10:00:00', 60 FROM public.services WHERE title = 'Food Assistance'
UNION ALL
SELECT id, 'Friday', '10:00:00', 60 FROM public.services WHERE title = 'Food Assistance'
UNION ALL
SELECT id, 'Wednesday', '09:00:00', 90 FROM public.services WHERE title = 'Healthcare Services'
UNION ALL
SELECT id, 'Saturday', '09:00:00', 90 FROM public.services WHERE title = 'Healthcare Services'
UNION ALL
SELECT id, 'Monday', '14:00:00', 60 FROM public.services WHERE title = 'Legal Aid'
UNION ALL
SELECT id, 'Wednesday', '14:00:00', 60 FROM public.services WHERE title = 'Legal Aid'
UNION ALL
SELECT id, 'Tuesday', '15:00:00', 90 FROM public.services WHERE title = 'Job Training'
UNION ALL
SELECT id, 'Thursday', '15:00:00', 90 FROM public.services WHERE title = 'Job Training';

-- Add google_calendar_event_id to service_bookings for tracking
ALTER TABLE public.service_bookings 
ADD COLUMN google_calendar_event_id TEXT;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for service_bookings
CREATE TRIGGER update_service_bookings_updated_at 
    BEFORE UPDATE ON public.service_bookings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update existing services with location data
UPDATE public.services SET location = 'Nairobi', delivery_mode = 'In-Person' WHERE location IS NULL;
UPDATE public.services SET location = 'Mombasa' WHERE title IN ('Emergency Shelter', 'Healthcare Services');
UPDATE public.services SET delivery_mode = 'Remote' WHERE title IN ('Legal Aid', 'Job Training');
