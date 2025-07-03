
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface ServiceSchedule {
  id: string;
  service_id: string;
  available_day: string;
  available_time: string;
  duration_minutes: number;
  max_bookings: number;
}

export interface ServiceBooking {
  id: string;
  user_id: string;
  service_id: string;
  service_title: string;
  booking_date: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  google_calendar_event_id?: string;
  created_at: string;
  updated_at: string;
}

export const useBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [schedules, setSchedules] = useState<ServiceSchedule[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBookings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('service_bookings' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('booking_date', { ascending: true });

      if (error) throw error;
      setBookings(data as ServiceBooking[] || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    }
  };

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('service_schedule' as any)
        .select('*')
        .order('available_day', { ascending: true });

      if (error) throw error;
      setSchedules(data as ServiceSchedule[] || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const createBooking = async (serviceId: string, serviceTitle: string, bookingDate: Date) => {
    if (!user) {
      toast.error('Please log in to book a service');
      return false;
    }

    setLoading(true);
    try {
      // Check for duplicate booking
      const { data: existingBooking } = await supabase
        .from('service_bookings' as any)
        .select('id')
        .eq('user_id', user.id)
        .eq('service_id', serviceId)
        .eq('booking_date', bookingDate.toISOString())
        .single();

      if (existingBooking) {
        toast.error('You already have a booking for this service at this time');
        return false;
      }

      // Create the booking
      const { data, error } = await supabase
        .from('service_bookings' as any)
        .insert({
          user_id: user.id,
          service_id: serviceId,
          service_title: serviceTitle,
          booking_date: bookingDate.toISOString(),
          status: 'confirmed'
        })
        .select()
        .single();

      if (error) throw error;

      // Create Google Calendar event
      try {
        const response = await supabase.functions.invoke('google-calendar-sync', {
          body: {
            action: 'create',
            booking: {
              id: data.id,
              service_title: serviceTitle,
              booking_date: bookingDate.toISOString(),
              user_id: user.id
            }
          }
        });

        if (response.data?.eventId) {
          // Update booking with Google Calendar event ID
          await supabase
            .from('service_bookings' as any)
            .update({ google_calendar_event_id: response.data.eventId })
            .eq('id', data.id);
        }
      } catch (calendarError) {
        console.error('Google Calendar sync failed:', calendarError);
        // Don't fail the booking if calendar sync fails
      }

      // Log the booking activity
      await supabase
        .from('chat_interactions')
        .insert({
          user_id: user.id,
          original_message: `Booked service: ${serviceTitle}`,
          response: `Service booking confirmed for ${bookingDate.toLocaleDateString()}`,
          matched_service: serviceTitle,
          matched_intent: 'service_booking'
        });

      toast.success('Service booked successfully!');
      await fetchBookings();
      return true;
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string, googleCalendarEventId?: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('service_bookings' as any)
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;

      // Cancel Google Calendar event
      if (googleCalendarEventId) {
        try {
          await supabase.functions.invoke('google-calendar-sync', {
            body: {
              action: 'cancel',
              eventId: googleCalendarEventId
            }
          });
        } catch (calendarError) {
          console.error('Google Calendar cancellation failed:', calendarError);
        }
      }

      toast.success('Booking cancelled successfully');
      await fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchSchedules();
  }, [user]);

  return {
    bookings,
    schedules,
    loading,
    createBooking,
    cancelBooking,
    refetchBookings: fetchBookings
  };
};
