
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BookingData {
  id: string;
  service_title: string;
  booking_date: string;
  user_id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, booking, eventId } = await req.json()
    
    // Initialize Google Calendar API (you'll need to set up OAuth2)
    const calendarId = Deno.env.get('GOOGLE_CALENDAR_ID') || 'primary'
    const accessToken = Deno.env.get('GOOGLE_ACCESS_TOKEN')
    
    if (!accessToken) {
      throw new Error('Google Calendar access token not configured')
    }

    if (action === 'create' && booking) {
      // Create Google Calendar event
      const event = {
        summary: `${booking.service_title} - ${booking.user_id}`,
        description: `Glo Service Booking\nService: ${booking.service_title}\nBooking ID: ${booking.id}`,
        start: {
          dateTime: booking.booking_date,
          timeZone: 'Africa/Nairobi',
        },
        end: {
          dateTime: new Date(new Date(booking.booking_date).getTime() + 60 * 60 * 1000).toISOString(), // +1 hour
          timeZone: 'Africa/Nairobi',
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 24 hours before
            { method: 'popup', minutes: 30 }, // 30 minutes before
          ],
        },
      }

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      )

      if (!response.ok) {
        throw new Error(`Google Calendar API error: ${response.statusText}`)
      }

      const createdEvent = await response.json()
      
      return new Response(
        JSON.stringify({ eventId: createdEvent.id }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (action === 'cancel' && eventId) {
      // Cancel Google Calendar event
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      )

      if (!response.ok && response.status !== 404) {
        throw new Error(`Google Calendar API error: ${response.statusText}`)
      }

      return new Response(
        JSON.stringify({ success: true }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    throw new Error('Invalid action or missing parameters')

  } catch (error) {
    console.error('Google Calendar sync error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
