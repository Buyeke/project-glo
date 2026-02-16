import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

async function authenticateRequest(req: Request) {
  const adminClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const apiKey = req.headers.get('x-api-key')
  if (apiKey) {
    const encoder = new TextEncoder()
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(apiKey))
    const keyHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')

    const { data: keyRecord } = await adminClient
      .from('organization_api_keys')
      .select('organization_id, scopes')
      .eq('key_hash', keyHash)
      .eq('is_active', true)
      .single()

    if (keyRecord) {
      const { data: org } = await adminClient
        .from('organizations')
        .select('id, tier, settings')
        .eq('id', keyRecord.organization_id)
        .eq('tier', 'education')
        .single()

      if (org) {
        return { orgId: org.id, org, role: 'api_key', userId: null, adminClient }
      }
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

  const { data: membership } = await adminClient
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', userId)
    .single()

  if (!membership) return null

  const { data: org } = await adminClient
    .from('organizations')
    .select('id, tier, settings')
    .eq('id', membership.organization_id)
    .eq('tier', 'education')
    .single()

  if (!org) return null

  return { orgId: org.id, org, role: membership.role, userId, adminClient }
}

function requireFacultyRole(role: string) {
  return ['owner', 'admin', 'faculty'].includes(role)
}

// --- Suspicious Activity Detection ---

async function detectSharedApiKeys(adminClient: any, orgId: string) {
  // Find students whose API key was used from 3+ IPs in the last hour
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
  // Compare endpoint sequences between students over the last 24h
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: usage } = await adminClient
    .from('edu_api_usage')
    .select('student_id, endpoint, method')
    .eq('organization_id', orgId)
    .gte('created_at', oneDayAgo)
    .order('created_at', { ascending: true })

  if (!usage || usage.length < 10) return []

  // Build sequence per student
  const sequences = new Map<string, string[]>()
  for (const row of usage) {
    if (!sequences.has(row.student_id)) sequences.set(row.student_id, [])
    sequences.get(row.student_id)!.push(`${row.method}:${row.endpoint}`)
  }

  // Jaccard similarity between pairs (only students with 5+ calls)
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
    const auth = await authenticateRequest(req)
    if (!auth) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!requireFacultyRole(auth.role)) {
      return new Response(JSON.stringify({ error: 'Faculty role required' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    if (req.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // GET ?action=dashboard — overview stats
    if (action === 'dashboard') {
      const { count: totalStudents } = await auth.adminClient
        .from('edu_students')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', auth.orgId)

      const { count: activeStudents } = await auth.adminClient
        .from('edu_students')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', auth.orgId)
        .eq('status', 'active')

      const { count: ethicsCertified } = await auth.adminClient
        .from('edu_students')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', auth.orgId)
        .eq('ethics_certified', true)

      const todayStart = new Date()
      todayStart.setUTCHours(0, 0, 0, 0)
      const { count: apiCallsToday } = await auth.adminClient
        .from('edu_api_usage')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', auth.orgId)
        .gte('created_at', todayStart.toISOString())

      const { count: totalProjects } = await auth.adminClient
        .from('edu_projects')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', auth.orgId)

      const { count: submittedProjects } = await auth.adminClient
        .from('edu_projects')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', auth.orgId)
        .eq('status', 'submitted')

      return new Response(JSON.stringify({
        total_students: totalStudents || 0,
        active_students: activeStudents || 0,
        ethics_certified: ethicsCertified || 0,
        api_calls_today: apiCallsToday || 0,
        total_projects: totalProjects || 0,
        pending_reviews: submittedProjects || 0,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // GET ?action=student-overview
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

      return new Response(JSON.stringify({ students: students || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // GET ?action=suspicious-activity
    if (action === 'suspicious-activity') {
      const [sharedKeys, unusualVolume, copyPaste] = await Promise.all([
        detectSharedApiKeys(auth.adminClient, auth.orgId),
        detectUnusualVolume(auth.adminClient, auth.orgId),
        detectCopyPaste(auth.adminClient, auth.orgId),
      ])

      const allFlags = [...sharedKeys, ...unusualVolume, ...copyPaste]
        .sort((a, b) => {
          const severityOrder = { high: 0, medium: 1, low: 2 }
          return (severityOrder[a.severity as keyof typeof severityOrder] || 2) -
                 (severityOrder[b.severity as keyof typeof severityOrder] || 2)
        })

      return new Response(JSON.stringify({
        flags: allFlags,
        summary: {
          total: allFlags.length,
          high: allFlags.filter(f => f.severity === 'high').length,
          medium: allFlags.filter(f => f.severity === 'medium').length,
          low: allFlags.filter(f => f.severity === 'low').length,
        },
        checked_at: new Date().toISOString(),
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // GET ?action=usage-report
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

      return new Response(JSON.stringify({
        usage: usage || [],
        period_days: days,
        since,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({
      error: 'Unknown action. Available: dashboard, student-overview, suspicious-activity, usage-report'
    }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error('education-faculty error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
