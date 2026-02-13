import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

async function authenticate(req: Request): Promise<{ orgId: string; userId?: string } | null> {
  const adminClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const apiKey = req.headers.get('x-api-key')
  if (apiKey) {
    const encoder = new TextEncoder()
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(apiKey))
    const keyHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')

    const { data: orgId } = await adminClient.rpc('validate_api_key', { p_key_hash: keyHash })
    if (orgId) {
      const { data: keyData } = await adminClient
        .from('organization_api_keys')
        .select('scopes')
        .eq('key_hash', keyHash)
        .single()

      if (!keyData?.scopes?.includes('reports:read')) return null
      return { orgId }
    }
  }

  const authHeader = req.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: claims, error } = await supabase.auth.getClaims(authHeader.replace('Bearer ', ''))
    if (error || !claims?.claims?.sub) return null

    const userId = claims.claims.sub
    const url = new URL(req.url)
    const orgId = url.searchParams.get('org_id')
    if (!orgId) return null

    const { data: membership } = await adminClient
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', userId)
      .single()

    if (!membership) return null
    return { orgId, userId }
  }

  return null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    const auth = await authenticate(req)
    if (!auth) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const url = new URL(req.url)
    const reportType = url.searchParams.get('type') || 'overview'
    const from = url.searchParams.get('from') || new Date(Date.now() - 30 * 86400000).toISOString()
    const to = url.searchParams.get('to') || new Date().toISOString()

    if (reportType === 'overview') {
      // Case metrics
      const { data: allCases } = await adminClient
        .from('org_cases')
        .select('status, priority, category, created_at, closed_at')
        .eq('organization_id', auth.orgId)

      const cases = allCases || []
      const periodCases = cases.filter(c => c.created_at >= from && c.created_at <= to)

      const caseMetrics = {
        total: cases.length,
        period_new: periodCases.length,
        open: cases.filter(c => c.status === 'open').length,
        in_progress: cases.filter(c => c.status === 'in_progress').length,
        closed: cases.filter(c => c.status === 'closed').length,
        archived: cases.filter(c => c.status === 'archived').length,
        by_priority: {
          critical: cases.filter(c => c.priority === 'critical').length,
          high: cases.filter(c => c.priority === 'high').length,
          medium: cases.filter(c => c.priority === 'medium').length,
          low: cases.filter(c => c.priority === 'low').length,
        },
        by_category: cases.reduce((acc: Record<string, number>, c) => {
          acc[c.category] = (acc[c.category] || 0) + 1
          return acc
        }, {}),
      }

      // KB metrics
      const { count: kbCount } = await adminClient
        .from('organization_knowledge_base')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', auth.orgId)
        .eq('is_active', true)

      // Intake metrics
      const { data: allSubs } = await adminClient
        .from('org_intake_submissions')
        .select('status, created_at')
        .eq('organization_id', auth.orgId)

      const subs = allSubs || []
      const periodSubs = subs.filter(s => s.created_at >= from && s.created_at <= to)

      const intakeMetrics = {
        total: subs.length,
        period_new: periodSubs.length,
        by_status: subs.reduce((acc: Record<string, number>, s) => {
          acc[s.status] = (acc[s.status] || 0) + 1
          return acc
        }, {}),
      }

      // Activity log summary
      const { data: activities } = await adminClient
        .from('org_activity_log')
        .select('activity_type, created_at')
        .eq('organization_id', auth.orgId)
        .gte('created_at', from)
        .lte('created_at', to)

      const activitySummary = (activities || []).reduce((acc: Record<string, number>, a) => {
        acc[a.activity_type] = (acc[a.activity_type] || 0) + 1
        return acc
      }, {})

      return new Response(JSON.stringify({
        report_type: 'overview',
        period: { from, to },
        cases: caseMetrics,
        knowledge_base: { total_entries: kbCount || 0 },
        intake: intakeMetrics,
        activity: activitySummary,
        generated_at: new Date().toISOString(),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (reportType === 'activity') {
      const limit = parseInt(url.searchParams.get('limit') || '100')
      const offset = parseInt(url.searchParams.get('offset') || '0')

      const { data, count, error } = await adminClient
        .from('org_activity_log')
        .select('*', { count: 'exact' })
        .eq('organization_id', auth.orgId)
        .gte('created_at', from)
        .lte('created_at', to)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      return new Response(JSON.stringify({ activities: data, total: count }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (reportType === 'cases-timeline') {
      const { data: cases } = await adminClient
        .from('org_cases')
        .select('created_at, status, priority')
        .eq('organization_id', auth.orgId)
        .gte('created_at', from)
        .lte('created_at', to)
        .order('created_at', { ascending: true })

      // Group by day
      const daily: Record<string, { opened: number; closed: number }> = {}
      for (const c of cases || []) {
        const day = c.created_at.substring(0, 10)
        if (!daily[day]) daily[day] = { opened: 0, closed: 0 }
        daily[day].opened++
      }

      return new Response(JSON.stringify({ timeline: daily }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Unknown report type. Use: overview, activity, cases-timeline' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('org-reports error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
