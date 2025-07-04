
-- Add meeting_link column to service_bookings table
ALTER TABLE public.service_bookings 
ADD COLUMN meeting_link TEXT;

-- Add phone_number column to support_requests table
ALTER TABLE public.support_requests 
ADD COLUMN phone_number TEXT;
