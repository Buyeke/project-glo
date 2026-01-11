
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://fznhhkxwzqipwfwihwqr.supabase.co',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

  const requestId = crypto.randomUUID();

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required', request_id: requestId }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token', request_id: requestId }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, booking, eventId } = await req.json()
    
    // Verify user authorization - user can only manage their own bookings or admins can manage all
    if (booking && booking.user_id !== user.id) {
      // Check if user is admin using team_members table (consistent with RLS)
      const { data: adminCheck } = await supabaseAuth
        .from('team_members')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .eq('verified', true)
        .single();

      if (!adminCheck) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized to manage this booking', request_id: requestId }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Initialize Google Calendar API (you'll need to set up OAuth2)
    const calendarId = Deno.env.get('GOOGLE_CALENDAR_ID') || 'primary'
    const accessToken = Deno.env.get('GOOGLE_ACCESS_TOKEN')
    
    if (!accessToken) {
      console.error('Google Calendar access token not configured');
      return new Response(
        JSON.stringify({ error: 'Calendar service not configured', request_id: requestId }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
        console.error('Google Calendar API error:', response.status);
        return new Response(
          JSON.stringify({ error: 'Failed to create calendar event', request_id: requestId }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const createdEvent = await response.json()
      
      // Log calendar event creation
      await supabaseAuth.from('security_logs').insert({
        event_type: 'admin_access',
        user_id: user.id,
        event_data: {
          action: 'calendar_event_created',
          booking_id: booking.id,
          event_id: createdEvent.id
        },
        ip_address: req.headers.get('cf-connecting-ip') || 'unknown'
      });
      
      return new Response(
        JSON.stringify({ eventId: createdEvent.id, request_id: requestId }),
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
        console.error('Google Calendar API error:', response.status);
        return new Response(
          JSON.stringify({ error: 'Failed to cancel calendar event', request_id: requestId }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Log calendar event cancellation
      await supabaseAuth.from('security_logs').insert({
        event_type: 'admin_access',
        user_id: user.id,
        event_data: {
          action: 'calendar_event_cancelled',
          event_id: eventId
        },
        ip_address: req.headers.get('cf-connecting-ip') || 'unknown'
      });

      return new Response(
        JSON.stringify({ success: true, request_id: requestId }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action or missing parameters', request_id: requestId }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Google Calendar sync error:', error)
    return new Response(
      JSON.stringify({ error: 'An error occurred while processing your request', request_id: requestId }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
