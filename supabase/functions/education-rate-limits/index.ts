import {
  authenticateEducationRequest, corsHeaders,
  errorResponse, jsonResponse, cachedJsonResponse,
  ErrorCode, requireScope, logAuditEvent,
} from '../_shared/edu-auth.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const auth = await authenticateEducationRequest(req)
    if (!auth) return errorResponse(ErrorCode.UNAUTHORIZED, 'Unauthorized. Faculty role required.', 401)

    // Only faculty/admin for rate limit management
    const scopeErr = requireScope(auth, 'education:admin')
    if (scopeErr) return scopeErr

    if (!['owner', 'admin', 'faculty'].includes(auth.role) && auth.role !== 'api_key') {
      return errorResponse(ErrorCode.FORBIDDEN, 'Faculty role required', 403)
    }

    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    if (req.method === 'GET') {
      if (action === 'current') {
        const { data: semester } = await auth.adminClient
          .from('edu_semesters')
          .select('*')
          .eq('organization_id', auth.orgId)
          .eq('is_active', true)
          .order('start_date', { ascending: false })
          .limit(1)
          .single()

        if (!semester) return errorResponse(ErrorCode.NOT_FOUND, 'No active semester found', 404)

        const { data: overrides } = await auth.adminClient
          .from('edu_students')
          .select('id, name, student_id_external, rate_limit_override')
          .eq('semester_id', semester.id)
          .not('rate_limit_override', 'is', null)

        return cachedJsonResponse({ semester, student_overrides: overrides || [] }, 30)
      }

      if (action === 'list-semesters') {
        const { data: semesters } = await auth.adminClient
          .from('edu_semesters')
          .select('*')
          .eq('organization_id', auth.orgId)
          .order('start_date', { ascending: false })

        return cachedJsonResponse({ semesters: semesters || [] }, 60)
      }

      return errorResponse(ErrorCode.VALIDATION_ERROR, 'Unknown action. Use: current, list-semesters', 400)
    }

    if (req.method === 'POST') {
      const body = await req.json()

      if (action === 'update-semester') {
        const { semester_id, rate_limit_normal, rate_limit_assignment, rate_limit_off_semester } = body
        if (!semester_id) return errorResponse(ErrorCode.VALIDATION_ERROR, 'semester_id required', 400)

        const settings: Record<string, number> = {}
        if (rate_limit_normal !== undefined) settings.rate_limit_normal = rate_limit_normal
        if (rate_limit_assignment !== undefined) settings.rate_limit_assignment = rate_limit_assignment
        if (rate_limit_off_semester !== undefined) settings.rate_limit_off_semester = rate_limit_off_semester

        const { data: existing } = await auth.adminClient
          .from('edu_semesters')
          .select('settings')
          .eq('id', semester_id)
          .eq('organization_id', auth.orgId)
          .single()

        if (!existing) return errorResponse(ErrorCode.NOT_FOUND, 'Semester not found', 404)

        const mergedSettings = { ...(existing.settings as Record<string, unknown>), ...settings }

        const { error } = await auth.adminClient
          .from('edu_semesters')
          .update({ settings: mergedSettings, updated_at: new Date().toISOString() })
          .eq('id', semester_id)
          .eq('organization_id', auth.orgId)

        if (error) throw error

        await logAuditEvent(auth.adminClient, auth.orgId, 'semester', 'rate_limits_updated', semester_id, auth.userId, settings)

        return jsonResponse({ success: true, settings: mergedSettings })
      }

      if (action === 'student-override') {
        const { student_id, daily_limit } = body
        if (!student_id || daily_limit === undefined) {
          return errorResponse(ErrorCode.VALIDATION_ERROR, 'student_id and daily_limit required', 400)
        }

        const { error } = await auth.adminClient
          .from('edu_students')
          .update({ rate_limit_override: daily_limit, updated_at: new Date().toISOString() })
          .eq('id', student_id)
          .eq('organization_id', auth.orgId)

        if (error) throw error

        await logAuditEvent(auth.adminClient, auth.orgId, 'student', 'rate_limit_override', student_id, auth.userId, { daily_limit })

        return jsonResponse({ success: true, student_id, rate_limit_override: daily_limit })
      }

      if (action === 'clear-override') {
        const { student_id } = body
        if (!student_id) return errorResponse(ErrorCode.VALIDATION_ERROR, 'student_id required', 400)

        const { error } = await auth.adminClient
          .from('edu_students')
          .update({ rate_limit_override: null, updated_at: new Date().toISOString() })
          .eq('id', student_id)
          .eq('organization_id', auth.orgId)

        if (error) throw error

        await logAuditEvent(auth.adminClient, auth.orgId, 'student', 'rate_limit_override_cleared', student_id, auth.userId)

        return jsonResponse({ success: true, student_id, rate_limit_override: null })
      }

      if (action === 'create-semester') {
        const { name, start_date, end_date, student_capacity = 40, rate_limit_normal = 100, rate_limit_assignment = 500, rate_limit_off_semester = 0 } = body
        if (!name || !start_date || !end_date) {
          return errorResponse(ErrorCode.VALIDATION_ERROR, 'name, start_date, end_date required', 400)
        }

        const { data: semester, error } = await auth.adminClient
          .from('edu_semesters')
          .insert({
            organization_id: auth.orgId,
            name,
            start_date,
            end_date,
            student_capacity,
            settings: { rate_limit_normal, rate_limit_assignment, rate_limit_off_semester },
          })
          .select()
          .single()

        if (error) throw error

        await logAuditEvent(auth.adminClient, auth.orgId, 'semester', 'created', semester.id, auth.userId, { name })

        return jsonResponse({ success: true, semester }, 201)
      }

      return errorResponse(ErrorCode.VALIDATION_ERROR, 'Unknown action', 400)
    }

    return errorResponse(ErrorCode.METHOD_NOT_ALLOWED, 'Method not allowed', 405)
  } catch (error) {
    console.error('education-rate-limits error:', error)
    return errorResponse(ErrorCode.INTERNAL_ERROR, 'Internal server error', 500)
  }
})
