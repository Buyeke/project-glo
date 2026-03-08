import {
  authenticateEducationRequest, corsHeaders, isFaculty,
  errorResponse, jsonResponse, paginatedResponse, parsePagination,
  ErrorCode, requireScope, logAuditEvent,
} from '../_shared/edu-auth.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const auth = await authenticateEducationRequest(req)
    if (!auth) return errorResponse(ErrorCode.UNAUTHORIZED, 'Unauthorized', 401)

    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    // --- GET: list or detail ---
    if (req.method === 'GET') {
      const scopeErr = requireScope(auth, 'education:read')
      if (scopeErr) return scopeErr

      if (action === 'detail') {
        const id = url.searchParams.get('assignment_id')
        if (!id) return errorResponse(ErrorCode.VALIDATION_ERROR, 'assignment_id required', 400)

        const { data, error } = await auth.adminClient
          .from('edu_assignments')
          .select('*, edu_semesters(name, start_date, end_date)')
          .eq('id', id)
          .eq('organization_id', auth.orgId)
          .single()

        if (error || !data) return errorResponse(ErrorCode.NOT_FOUND, 'Assignment not found', 404)

        const { count } = await auth.adminClient
          .from('edu_projects')
          .select('id', { count: 'exact', head: true })
          .eq('assignment_id', id)

        return jsonResponse({ ...data, project_count: count || 0 })
      }

      // Default: list with pagination
      const pagination = parsePagination(url)

      let countQuery = auth.adminClient
        .from('edu_assignments')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', auth.orgId)

      let query = auth.adminClient
        .from('edu_assignments')
        .select('*, edu_semesters(name)')
        .eq('organization_id', auth.orgId)
        .order('created_at', { ascending: false })
        .range(pagination.offset, pagination.offset + pagination.limit - 1)

      const semesterId = url.searchParams.get('semester_id')
      if (semesterId) {
        query = query.eq('semester_id', semesterId)
        countQuery = countQuery.eq('semester_id', semesterId)
      }

      const activeOnly = url.searchParams.get('active_only')
      if (activeOnly === 'true') {
        query = query.eq('is_active', true)
        countQuery = countQuery.eq('is_active', true)
      }

      const [{ data }, { count }] = await Promise.all([query, countQuery])
      return paginatedResponse(data || [], count || 0, pagination)
    }

    // --- POST: faculty-only mutations ---
    if (req.method === 'POST') {
      if (!isFaculty(auth.role)) return errorResponse(ErrorCode.FORBIDDEN, 'Faculty role required', 403)

      const scopeErr = requireScope(auth, 'education:write')
      if (scopeErr) return scopeErr

      const body = await req.json()

      if (action === 'create') {
        const { title, description, difficulty, semester_id, deadline, starter_query, rate_override_per_day } = body
        if (!title) return errorResponse(ErrorCode.VALIDATION_ERROR, 'title required', 400)

        const { data, error } = await auth.adminClient
          .from('edu_assignments')
          .insert({
            organization_id: auth.orgId,
            title,
            description: description || null,
            difficulty: difficulty || 'beginner',
            semester_id: semester_id || null,
            deadline: deadline || null,
            starter_query: starter_query || null,
            rate_override_per_day: rate_override_per_day || null,
            created_by: auth.userId,
            is_active: true,
          })
          .select()
          .single()

        if (error) throw error

        await logAuditEvent(auth.adminClient, auth.orgId, 'assignment', 'created', data.id, auth.userId, { title })

        return jsonResponse(data, 201)
      }

      if (action === 'update') {
        const { assignment_id, ...fields } = body
        if (!assignment_id) return errorResponse(ErrorCode.VALIDATION_ERROR, 'assignment_id required', 400)

        const allowed = ['title', 'description', 'difficulty', 'deadline', 'starter_query', 'rate_override_per_day', 'is_active']
        const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
        for (const key of allowed) {
          if (fields[key] !== undefined) updates[key] = fields[key]
        }

        const { error } = await auth.adminClient
          .from('edu_assignments')
          .update(updates)
          .eq('id', assignment_id)
          .eq('organization_id', auth.orgId)

        if (error) throw error

        await logAuditEvent(auth.adminClient, auth.orgId, 'assignment', 'updated', assignment_id, auth.userId, updates)

        return jsonResponse({ success: true })
      }

      if (action === 'activate' || action === 'deactivate') {
        const { assignment_id } = body
        if (!assignment_id) return errorResponse(ErrorCode.VALIDATION_ERROR, 'assignment_id required', 400)

        const isActive = action === 'activate'
        const { error } = await auth.adminClient
          .from('edu_assignments')
          .update({ is_active: isActive, updated_at: new Date().toISOString() })
          .eq('id', assignment_id)
          .eq('organization_id', auth.orgId)

        if (error) throw error

        await logAuditEvent(auth.adminClient, auth.orgId, 'assignment', action, assignment_id, auth.userId)

        return jsonResponse({ success: true, is_active: isActive })
      }

      return errorResponse(ErrorCode.VALIDATION_ERROR, 'Unknown action', 400)
    }

    return errorResponse(ErrorCode.METHOD_NOT_ALLOWED, 'Method not allowed', 405)
  } catch (error) {
    console.error('education-assignments error:', error)
    return errorResponse(ErrorCode.INTERNAL_ERROR, 'Internal server error', 500)
  }
})
