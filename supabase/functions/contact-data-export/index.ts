
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const requestId = crypto.randomUUID();

  try {
    // Verify JWT token and admin privileges
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required', request_id: requestId }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Verify the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.error('Auth error:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication', request_id: requestId }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if user is admin using team_members table (consistent with RLS)
    const { data: adminCheck, error: adminError } = await supabase
      .from('team_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .eq('verified', true)
      .single()

    if (adminError || !adminCheck) {
      console.error('Admin check failed:', adminError?.message);
      return new Response(
        JSON.stringify({ error: 'Admin access required', request_id: requestId }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Log security event
    await supabase.from('security_logs').insert({
      event_type: 'data_export',
      user_id: user.id,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
      event_data: { action: 'contact_data_export' }
    })

    // Export contact data
    const { data: contacts, error } = await supabase
      .from('contact_submissions')
      .select(`
        id,
        name,
        email,
        message,
        created_at,
        contacts (
          phone,
          preferred_language,
          last_submission_timestamp
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Data export query error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to export data', request_id: requestId }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const securityHeaders = {
      ...corsHeaders,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'none'",
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    }

    return new Response(JSON.stringify(contacts), {
      headers: {
        ...securityHeaders,
        'Content-Type': 'application/json',
      },
    })

  } catch (error) {
    console.error('Contact data export error:', error)
    
    return new Response(
      JSON.stringify({ error: 'An error occurred while processing your request', request_id: requestId }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    )
  }
})
