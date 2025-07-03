
-- Create service_bookings table
CREATE TABLE public.service_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  service_id UUID NOT NULL,
  service_title TEXT NOT NULL,
  booking_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  google_calendar_event_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service_schedule table
CREATE TABLE public.service_schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID NOT NULL,
  available_day TEXT NOT NULL,
  available_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  max_bookings INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add missing columns to services table
ALTER TABLE public.services 
ADD COLUMN location TEXT DEFAULT 'Nairobi',
ADD COLUMN delivery_mode TEXT DEFAULT 'In-Person';

-- Add Row Level Security for service_bookings
ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;

-- Users can view their own bookings
CREATE POLICY "Users can view their own bookings" 
  ON public.service_bookings 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can create their own bookings
CREATE POLICY "Users can create their own bookings" 
  ON public.service_bookings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own bookings
CREATE POLICY "Users can update their own bookings" 
  ON public.service_bookings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add Row Level Security for service_schedule
ALTER TABLE public.service_schedule ENABLE ROW LEVEL SECURITY;

-- Anyone can view service schedules
CREATE POLICY "Anyone can view service schedules" 
  ON public.service_schedule 
  FOR SELECT 
  USING (true);

-- Admins can manage service schedules
CREATE POLICY "Admins can manage service schedules" 
  ON public.service_schedule 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.user_type = 'admin'
  ));
