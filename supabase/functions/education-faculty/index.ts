import {
  authenticateEducationRequest, corsHeaders, isFaculty,
  errorResponse, jsonResponse, cachedJsonResponse,
  ErrorCode, requireScope, logAuditEvent,
} from '../_shared/edu-auth.ts'

// --- Suspicious Activity Detection ---

async function detectSharedApiKeys(adminClient: any, orgId: string) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { data: usage } = await adminClient
    .from('edu_api_usage')
    .select('student_id, ip_address')
    .eq('organization_id', orgId)
    .gte('created_at', oneHourAgo)
    .not('ip_address', 'is', null)

  if (!usage || usage.length === 0) return []

  const studentIps = new Map<string, Set<string>>()
  for (const row of usage) {
    if (!studentIps.has(row.student_id)) studentIps.set(row.student_id, new Set())
    studentIps.get(row.student_id)!.add(row.ip_address)
  }

  const flags = []
  for (const [studentId, ips] of studentIps) {
    if (ips.size >= 3) {
      flags.push({
        student_id: studentId,
        flag_type: 'shared_api_key',
        severity: ips.size >= 5 ? 'high' : 'medium',
        details: `${ips.size} distinct IPs in the last hour`,
        detected_at: new Date().toISOString(),
      })
    }
  }
  return flags
}

async function detectUnusualVolume(adminClient: any, orgId: string) {
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)

  const { data: usage } = await adminClient
    .from('edu_api_usage')
    .select('student_id')
    .eq('organization_id', orgId)
    .gte('created_at', todayStart.toISOString())

  if (!usage || usage.length === 0) return []

  const counts = new Map<string, number>()
  for (const row of usage) {
    counts.set(row.student_id, (counts.get(row.student_id) || 0) + 1)
  }

  const values = Array.from(counts.values())
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  const threshold = avg * 3

  const flags = []
  for (const [studentId, count] of counts) {
    if (count > threshold && threshold > 0) {
      flags.push({
        student_id: studentId,
        flag_type: 'unusual_volume',
        severity: count > threshold * 2 ? 'high' : count > threshold * 1.5 ? 'medium' : 'low',
        details: `${count} calls today (cohort avg: ${Math.round(avg)}, threshold: ${Math.round(threshold)})`,
        detected_at: new Date().toISOString(),
      })
    }
  }
  return flags
}

async function detectCopyPaste(adminClient: any, orgId: string) {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data: usage } = await adminClient
    .from('edu_api_usage')
    .select('student_id, endpoint, method')
    .eq('organization_id', orgId)
    .gte('created_at', oneDayAgo)
    .order('created_at', { ascending: true })

  if (!usage || usage.length < 10) return []

  const sequences = new Map<string, string[]>()
  for (const row of usage) {
    if (!sequences.has(row.student_id)) sequences.set(row.student_id, [])
    sequences.get(row.student_id)!.push(`${row.method}:${row.endpoint}`)
  }

  const studentIds = Array.from(sequences.keys()).filter(id => sequences.get(id)!.length >= 5)
  const flags = []

  for (let i = 0; i < studentIds.length; i++) {
    for (let j = i + 1; j < studentIds.length; j++) {
      const setA = new Set(sequences.get(studentIds[i])!)
      const setB = new Set(sequences.get(studentIds[j])!)
      const intersection = new Set([...setA].filter(x => setB.has(x)))
      const union = new Set([...setA, ...setB])
      const jaccard = intersection.size / union.size

      if (jaccard >= 0.8) {
        flags.push({
          student_id: studentIds[i],
          flag_type: 'copy_paste',
          severity: jaccard >= 0.95 ? 'high' : 'medium',
          details: `${Math.round(jaccard * 100)}% similarity with student ${studentIds[j]}`,
          detected_at: new Date().toISOString(),
        })
        flags.push({
          student_id: studentIds[j],
          flag_type: 'copy_paste',
          severity: jaccard >= 0.95 ? 'high' : 'medium',
          details: `${Math.round(jaccard * 100)}% similarity with student ${studentIds[i]}`,
          detected_at: new Date().toISOString(),
        })
      }
    }
  }
  return flags
}

// --- Main handler ---

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const auth = await authenticateEducationRequest(req)
    if (!auth) return errorResponse(ErrorCode.UNAUTHORIZED, 'Unauthorized', 401)

    if (!isFaculty(auth.role)) return errorResponse(ErrorCode.FORBIDDEN, 'Faculty role required', 403)

    const scopeErr = requireScope(auth, 'education:read')
    if (scopeErr) return scopeErr

    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    if (req.method !== 'GET') {
      return errorResponse(ErrorCode.METHOD_NOT_ALLOWED, 'Method not allowed', 405)
    }

    // Dashboard — cacheable for 60s
    if (action === 'dashboard') {
      const [
        { count: totalStudents },
        { count: activeStudents },
        { count: ethicsCertified },
        { count: totalProjects },
        { count: submittedProjects },
      ] = await Promise.all([
        auth.adminClient.from('edu_students').select('id', { count: 'exact', head: true }).eq('organization_id', auth.orgId),
        auth.adminClient.from('edu_students').select('id', { count: 'exact', head: true }).eq('organization_id', auth.orgId).eq('status', 'active'),
        auth.adminClient.from('edu_students').select('id', { count: 'exact', head: true }).eq('organization_id', auth.orgId).eq('ethics_certified', true),
        auth.adminClient.from('edu_projects').select('id', { count: 'exact', head: true }).eq('organization_id', auth.orgId),
        auth.adminClient.from('edu_projects').select('id', { count: 'exact', head: true }).eq('organization_id', auth.orgId).eq('status', 'submitted'),
      ])

      const todayStart = new Date()
      todayStart.setUTCHours(0, 0, 0, 0)
      const { count: apiCallsToday } = await auth.adminClient
        .from('edu_api_usage')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', auth.orgId)
        .gte('created_at', todayStart.toISOString())

      return cachedJsonResponse({
        total_students: totalStudents || 0,
        active_students: activeStudents || 0,
        ethics_certified: ethicsCertified || 0,
        api_calls_today: apiCallsToday || 0,
        total_projects: totalProjects || 0,
        pending_reviews: submittedProjects || 0,
      }, 60)
    }

    if (action === 'student-overview') {
      const semesterId = url.searchParams.get('semester_id')
      let query = auth.adminClient
        .from('edu_students')
        .select('id, name, email, student_id_external, status, ethics_certified, last_active_at, rate_limit_override')
        .eq('organization_id', auth.orgId)
        .order('name')

      if (semesterId) query = query.eq('semester_id', semesterId)

      const { data: students, error } = await query
      if (error) throw error

      return cachedJsonResponse({ students: students || [] }, 30)
    }

    if (action === 'suspicious-activity') {
      const [sharedKeys, unusualVolume, copyPaste] = await Promise.all([
        detectSharedApiKeys(auth.adminClient, auth.orgId),
        detectUnusualVolume(auth.adminClient, auth.orgId),
        detectCopyPaste(auth.adminClient, auth.orgId),
      ])

      const allFlags = [...sharedKeys, ...unusualVolume, ...copyPaste]
        .sort((a, b) => {
          const severityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }
          return (severityOrder[a.severity] || 2) - (severityOrder[b.severity] || 2)
        })

      return jsonResponse({
        flags: allFlags,
        summary: {
          total: allFlags.length,
          high: allFlags.filter(f => f.severity === 'high').length,
          medium: allFlags.filter(f => f.severity === 'medium').length,
          low: allFlags.filter(f => f.severity === 'low').length,
        },
        checked_at: new Date().toISOString(),
      })
    }

    if (action === 'usage-report') {
      const days = parseInt(url.searchParams.get('days') || '7')
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

      const { data: usage } = await auth.adminClient
        .from('edu_api_usage')
        .select('student_id, endpoint, method, status_code, created_at, is_sandbox')
        .eq('organization_id', auth.orgId)
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(1000)

      return jsonResponse({ usage: usage || [], period_days: days, since })
    }

    return errorResponse(ErrorCode.VALIDATION_ERROR,
      'Unknown action. Available: dashboard, student-overview, suspicious-activity, usage-report', 400)
  } catch (error) {
    console.error('education-faculty error:', error)
    return errorResponse(ErrorCode.INTERNAL_ERROR, 'Internal server error', 500)
  }
})
