import {
  authenticateEducationRequest, corsHeaders,
  errorResponse, jsonResponse, cachedJsonResponse, paginatedResponse, parsePagination,
  ErrorCode, requireScope,
} from '../_shared/edu-auth.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'GET') {
    return errorResponse(ErrorCode.METHOD_NOT_ALLOWED, 'Method not allowed', 405)
  }

  try {
    const auth = await authenticateEducationRequest(req)
    if (!auth) return errorResponse(ErrorCode.UNAUTHORIZED, 'Unauthorized', 401)

    const scopeErr = requireScope(auth, 'education:read')
    if (scopeErr) return scopeErr

    const url = new URL(req.url)
    const scope = url.searchParams.get('scope') || 'student'
    const format = url.searchParams.get('format')

    // Student analytics
    if (scope === 'student') {
      const studentId = url.searchParams.get('student_id') || auth.studentId
      if (!studentId) return errorResponse(ErrorCode.VALIDATION_ERROR, 'student_id required for student scope', 400)

      if (auth.role === 'student' && studentId !== auth.studentId) {
        return errorResponse(ErrorCode.FORBIDDEN, 'Cannot view other students\' analytics', 403)
      }

      const { count: totalCalls } = await auth.adminClient
        .from('edu_api_usage')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', studentId)

      const { data: endpointUsage } = await auth.adminClient
        .from('edu_api_usage')
        .select('endpoint, method, status_code, is_sandbox, created_at')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(500)

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

      return cachedJsonResponse(analytics, 30)
    }

    if (scope === 'cohort') {
      if (auth.role === 'student') {
        return errorResponse(ErrorCode.FORBIDDEN, 'Faculty role required for cohort analytics', 403)
      }

      const { data: students } = await auth.adminClient
        .from('edu_students')
        .select('id, name, student_id_external')
        .eq('organization_id', auth.orgId)

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
          allErrors[`${u.status_code}`] = (allErrors[`${u.status_code}`] || 0) + 1
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

      return cachedJsonResponse(cohortAnalytics, 60)
    }

    if (scope === 'timeseries') {
      if (auth.role === 'student' && !auth.studentId) {
        return errorResponse(ErrorCode.FORBIDDEN, 'Unauthorized', 403)
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

      return cachedJsonResponse({ period, timeseries }, 30)
    }

    return errorResponse(ErrorCode.VALIDATION_ERROR, 'Invalid scope. Use: student, cohort, timeseries', 400)
  } catch (error) {
    console.error('education-analytics error:', error)
    return errorResponse(ErrorCode.INTERNAL_ERROR, 'Internal server error', 500)
  }
})
