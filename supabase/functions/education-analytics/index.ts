import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

async function authenticateEducationUser(req: Request) {
  const adminClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const apiKey = req.headers.get('x-api-key')
  if (apiKey) {
    const encoder = new TextEncoder()
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(apiKey))
    const keyHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')

    const { data: student } = await adminClient
      .from('edu_students')
      .select('id, organization_id, semester_id, status, ethics_certified')
      .eq('api_key_hash', keyHash)
      .eq('status', 'active')
      .single()

    if (student) {
      return { studentId: student.id, orgId: student.organization_id, semesterId: student.semester_id, role: 'student', adminClient }
    }

    const { data: keyRecord } = await adminClient
      .from('organization_api_keys')
      .select('organization_id')
      .eq('key_hash', keyHash)
      .eq('is_active', true)
      .single()

    if (keyRecord) {
      const { data: org } = await adminClient
        .from('organizations')
        .select('id, tier')
        .eq('id', keyRecord.organization_id)
        .eq('tier', 'education')
        .single()

      if (org) return { studentId: null, orgId: org.id, semesterId: null, role: 'faculty', adminClient }
    }
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: claims, error } = await supabase.auth.getClaims(authHeader.replace('Bearer ', ''))
  if (error || !claims?.claims?.sub) return null
  const userId = claims.claims.sub as string

  const { data: student } = await adminClient
    .from('edu_students')
    .select('id, organization_id, semester_id, status')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (student) return { studentId: student.id, orgId: student.organization_id, semesterId: student.semester_id, role: 'student', adminClient }

  const { data: membership } = await adminClient
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', userId)
    .in('role', ['owner', 'admin', 'faculty'])
    .single()

  if (membership) {
    const { data: org } = await adminClient
      .from('organizations')
      .select('id, tier')
      .eq('id', membership.organization_id)
      .eq('tier', 'education')
      .single()

    if (org) return { studentId: null, orgId: org.id, semesterId: null, role: 'faculty', adminClient }
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
    const auth = await authenticateEducationUser(req)
    if (!auth) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const url = new URL(req.url)
    const scope = url.searchParams.get('scope') || 'student'
    const format = url.searchParams.get('format')

    // Student can only see own analytics
    if (scope === 'student') {
      const studentId = url.searchParams.get('student_id') || auth.studentId
      if (!studentId) {
        return new Response(JSON.stringify({ error: 'student_id required for student scope' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Only allow students to see their own data, faculty can see any
      if (auth.role === 'student' && studentId !== auth.studentId) {
        return new Response(JSON.stringify({ error: 'Cannot view other students\' analytics' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Total calls
      const { count: totalCalls } = await auth.adminClient
        .from('edu_api_usage')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', studentId)

      // Calls by endpoint
      const { data: endpointUsage } = await auth.adminClient
        .from('edu_api_usage')
        .select('endpoint, method, status_code, is_sandbox, created_at')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(500)

      // Calculate metrics
      const endpoints: Record<string, number> = {}
      let errorCount = 0
      let sandboxCount = 0
      const activeDays = new Set<string>()

      for (const u of endpointUsage || []) {
        endpoints[u.endpoint] = (endpoints[u.endpoint] || 0) + 1
        if (u.status_code && u.status_code >= 400) errorCount++
        if (u.is_sandbox) sandboxCount++
        activeDays.add(new Date(u.created_at).toISOString().split('T')[0])
      }

      const analytics = {
        student_id: studentId,
        total_calls: totalCalls || 0,
        endpoints_breakdown: endpoints,
        error_rate: totalCalls ? (errorCount / totalCalls * 100).toFixed(1) + '%' : '0%',
        active_days: activeDays.size,
        sandbox_calls: sandboxCount,
        live_calls: (totalCalls || 0) - sandboxCount,
        complexity_score: Math.min(10, Object.keys(endpoints).length * 1.5 + activeDays.size * 0.5),
      }

      if (format === 'csv') {
        const csv = `metric,value\ntotal_calls,${analytics.total_calls}\nerror_rate,${analytics.error_rate}\nactive_days,${analytics.active_days}\nsandbox_calls,${analytics.sandbox_calls}\nlive_calls,${analytics.live_calls}\ncomplexity_score,${analytics.complexity_score}`
        return new Response(csv, {
          headers: { ...corsHeaders, 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="student-analytics.csv"' }
        })
      }

      return new Response(JSON.stringify(analytics), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (scope === 'cohort') {
      if (auth.role === 'student') {
        return new Response(JSON.stringify({ error: 'Faculty role required for cohort analytics' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Get all students in org
      const { data: students } = await auth.adminClient
        .from('edu_students')
        .select('id, name, student_id_external')
        .eq('organization_id', auth.orgId)

      // Get usage counts per student
      const { data: usage } = await auth.adminClient
        .from('edu_api_usage')
        .select('student_id, endpoint, status_code, is_sandbox, created_at')
        .eq('organization_id', auth.orgId)
        .order('created_at', { ascending: false })
        .limit(1000)

      const studentUsage: Record<string, { calls: number; errors: number; endpoints: Set<string> }> = {}
      const allEndpoints: Record<string, number> = {}
      const allErrors: Record<string, number> = {}

      for (const u of usage || []) {
        if (!studentUsage[u.student_id]) {
          studentUsage[u.student_id] = { calls: 0, errors: 0, endpoints: new Set() }
        }
        studentUsage[u.student_id].calls++
        studentUsage[u.student_id].endpoints.add(u.endpoint)
        allEndpoints[u.endpoint] = (allEndpoints[u.endpoint] || 0) + 1

        if (u.status_code && u.status_code >= 400) {
          studentUsage[u.student_id].errors++
          const errorKey = `${u.status_code}`
          allErrors[errorKey] = (allErrors[errorKey] || 0) + 1
        }
      }

      const callCounts = Object.values(studentUsage).map(s => s.calls)
      const avgCalls = callCounts.length > 0 ? callCounts.reduce((a, b) => a + b, 0) / callCounts.length : 0

      const cohortAnalytics = {
        total_students: students?.length || 0,
        active_students: Object.keys(studentUsage).length,
        total_api_calls: (usage || []).length,
        average_calls_per_student: Math.round(avgCalls),
        most_used_endpoints: Object.entries(allEndpoints).sort((a, b) => b[1] - a[1]).slice(0, 10),
        common_errors: Object.entries(allErrors).sort((a, b) => b[1] - a[1]).slice(0, 5),
        student_summary: (students || []).map(s => ({
          student_id: s.id,
          student_id_external: s.student_id_external,
          name: s.name,
          total_calls: studentUsage[s.id]?.calls || 0,
          error_count: studentUsage[s.id]?.errors || 0,
          unique_endpoints: studentUsage[s.id]?.endpoints.size || 0,
        })),
      }

      if (format === 'csv') {
        const header = 'student_id,name,total_calls,error_count,unique_endpoints'
        const rows = cohortAnalytics.student_summary.map(s =>
          `${s.student_id_external},${s.name},${s.total_calls},${s.error_count},${s.unique_endpoints}`
        )
        return new Response([header, ...rows].join('\n'), {
          headers: { ...corsHeaders, 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="cohort-analytics.csv"' }
        })
      }

      return new Response(JSON.stringify(cohortAnalytics), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (scope === 'timeseries') {
      if (auth.role === 'student' && !auth.studentId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const period = url.searchParams.get('period') || 'daily'
      const days = period === 'weekly' ? 90 : 30
      const since = new Date()
      since.setDate(since.getDate() - days)

      let query = auth.adminClient
        .from('edu_api_usage')
        .select('created_at, endpoint, status_code, is_sandbox')
        .eq('organization_id', auth.orgId)
        .gte('created_at', since.toISOString())
        .order('created_at')
        .limit(1000)

      if (auth.role === 'student' && auth.studentId) {
        query = query.eq('student_id', auth.studentId)
      }

      const { data: usage } = await query

      const buckets: Record<string, { calls: number; errors: number; sandbox: number }> = {}

      for (const u of usage || []) {
        const date = new Date(u.created_at)
        let key: string
        if (period === 'weekly') {
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          key = weekStart.toISOString().split('T')[0]
        } else {
          key = date.toISOString().split('T')[0]
        }
        if (!buckets[key]) buckets[key] = { calls: 0, errors: 0, sandbox: 0 }
        buckets[key].calls++
        if (u.status_code && u.status_code >= 400) buckets[key].errors++
        if (u.is_sandbox) buckets[key].sandbox++
      }

      const timeseries = Object.entries(buckets)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, data]) => ({ date, ...data }))

      return new Response(JSON.stringify({ period, timeseries }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid scope. Use: student, cohort, timeseries' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('education-analytics error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
