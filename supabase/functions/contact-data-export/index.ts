import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const requestId = crypto.randomUUID();

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required', request_id: requestId }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication', request_id: requestId }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check admin
    const { data: adminCheck, error: adminError } = await supabase
      .from('team_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .eq('verified', true)
      .single()

    if (adminError || !adminCheck) {
      return new Response(
        JSON.stringify({ error: 'Admin access required', request_id: requestId }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body for format preference
    let format = 'csv'
    try {
      const body = await req.json()
      format = body?.format || 'csv'
    } catch {
      // Default to csv
    }

    // Log security event
    await supabase.from('security_logs').insert({
      event_type: 'data_export',
      user_id: user.id,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
      event_data: { action: 'contact_data_export', format }
    })

    // Export contact data
    const { data: contacts, error } = await supabase
      .from('contact_submissions')
      .select('id, name, email, message, status, admin_notes, created_at, updated_at, responded_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Data export query error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to export data', request_id: requestId }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const securityHeaders = {
      ...corsHeaders,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    }

    if (format === 'csv') {
      // Build CSV
      const headers = ['ID', 'Name', 'Email', 'Message', 'Status', 'Admin Notes', 'Created At', 'Updated At', 'Responded At']
      const escapeCSV = (val: any) => {
        if (val === null || val === undefined) return ''
        const str = String(val)
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      }

      const rows = (contacts || []).map(c => [
        escapeCSV(c.id),
        escapeCSV(c.name),
        escapeCSV(c.email),
        escapeCSV(c.message),
        escapeCSV(c.status),
        escapeCSV(c.admin_notes),
        escapeCSV(c.created_at),
        escapeCSV(c.updated_at),
        escapeCSV(c.responded_at),
      ].join(','))

      const csv = [headers.join(','), ...rows].join('\n')
      const timestamp = new Date().toISOString().split('T')[0]

      return new Response(csv, {
        headers: {
          ...securityHeaders,
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="contact-submissions-${timestamp}.csv"`,
        },
      })
    }

    // JSON format
    return new Response(JSON.stringify({
      data: contacts,
      exported_at: new Date().toISOString(),
      total: contacts?.length || 0,
    }), {
      headers: { ...securityHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Contact data export error:', error)
    return new Response(
      JSON.stringify({ error: 'An error occurred while processing your request', request_id: requestId }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
