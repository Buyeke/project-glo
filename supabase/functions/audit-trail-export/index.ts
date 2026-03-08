import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    // Verify admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Check admin status
    const { data: teamMember } = await adminClient
      .from('team_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .eq('verified', true)
      .maybeSingle()

    if (!teamMember) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { table_filter, action_filter } = await req.json()

    let query = adminClient
      .from('audit_trail')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10000)

    if (table_filter) query = query.eq('table_name', table_filter)
    if (action_filter) query = query.eq('action', action_filter)

    const { data: records, error } = await query
    if (error) throw error

    // Build CSV
    const headers = ['Timestamp', 'Table', 'Action', 'Record ID', 'Changed Fields', 'Performed By', 'Old Data', 'New Data']
    const rows = (records || []).map((r: any) => [
      r.created_at,
      r.table_name,
      r.action,
      r.record_id,
      (r.changed_fields || []).join('; '),
      r.performed_by || 'system',
      JSON.stringify(r.old_data || {}),
      JSON.stringify(r.new_data || {}),
    ])

    const escapeCsv = (val: string) => `"${String(val).replace(/"/g, '""')}"`
    const csv = [
      headers.map(escapeCsv).join(','),
      ...rows.map((row: string[]) => row.map(escapeCsv).join(','))
    ].join('\n')

    return new Response(csv, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="audit-trail-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('audit-trail-export error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
