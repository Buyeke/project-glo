import {
  authenticateEducationRequest, corsHeaders, isFaculty,
  errorResponse, jsonResponse, paginatedResponse, parsePagination,
  ErrorCode, requireScope, logAuditEvent, hashApiKey,
} from '../_shared/edu-auth.ts'

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

    // GET: list students or export
    if (req.method === 'GET') {
      if (action === 'export') {
        const { data: students } = await auth.adminClient
          .from('edu_students')
          .select('student_id_external, name, email, status, ethics_certified, last_active_at, created_at')
          .eq('organization_id', auth.orgId)
          .order('name')

        const header = 'student_id,name,email,status,ethics_certified,last_active_at,created_at'
        const rows = (students || []).map(s =>
          `${s.student_id_external},${s.name},${s.email},${s.status},${s.ethics_certified},${s.last_active_at || ''},${s.created_at}`
        )
        const csv = [header, ...rows].join('\n')

        return new Response(csv, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="students.csv"',
          }
        })
      }

      // Default: list with pagination
      const pagination = parsePagination(url)
      const semesterId = url.searchParams.get('semester_id')

      let countQuery = auth.adminClient
        .from('edu_students')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', auth.orgId)

      let query = auth.adminClient
        .from('edu_students')
        .select('*')
        .eq('organization_id', auth.orgId)
        .order('name')
        .range(pagination.offset, pagination.offset + pagination.limit - 1)

      if (semesterId) {
        query = query.eq('semester_id', semesterId)
        countQuery = countQuery.eq('semester_id', semesterId)
      }

      const [{ data: students, error }, { count }] = await Promise.all([query, countQuery])
      if (error) throw error

      return paginatedResponse(students || [], count || 0, pagination)
    }

    // POST actions
    if (req.method === 'POST') {
      const writeErr = requireScope(auth, 'education:write')
      if (writeErr) return writeErr

      const body = await req.json()

      if (action === 'import') {
        const { students, semester_id } = body
        if (!students || !Array.isArray(students) || !semester_id) {
          return errorResponse(ErrorCode.VALIDATION_ERROR, 'Required: students array and semester_id', 400)
        }

        const { data: semester } = await auth.adminClient
          .from('edu_semesters')
          .select('student_capacity')
          .eq('id', semester_id)
          .eq('organization_id', auth.orgId)
          .single()

        if (!semester) return errorResponse(ErrorCode.NOT_FOUND, 'Semester not found', 404)

        const { count: existingCount } = await auth.adminClient
          .from('edu_students')
          .select('id', { count: 'exact', head: true })
          .eq('semester_id', semester_id)

        if ((existingCount || 0) + students.length > semester.student_capacity) {
          return errorResponse(ErrorCode.CAPACITY_EXCEEDED,
            `Capacity exceeded. Capacity: ${semester.student_capacity}, current: ${existingCount}, importing: ${students.length}`,
            400,
            { capacity: semester.student_capacity, current: existingCount, importing: students.length }
          )
        }

        const cohortKey = `glo_stu_${crypto.randomUUID().replace(/-/g, '')}`
        const keyHash = await hashApiKey(cohortKey)

        const studentRows = students.map((s: { student_id: string; name: string; email: string }) => ({
          organization_id: auth.orgId,
          semester_id,
          student_id_external: s.student_id,
          name: s.name,
          email: s.email,
          role: 'read_only',
          ethics_certified: false,
          status: 'active',
          api_key_hash: keyHash,
        }))

        const { data: inserted, error: insertError } = await auth.adminClient
          .from('edu_students')
          .insert(studentRows)
          .select()

        if (insertError) {
          return errorResponse(ErrorCode.INTERNAL_ERROR, insertError.message, 500)
        }

        await logAuditEvent(auth.adminClient, auth.orgId, 'students', 'bulk_import', semester_id, auth.userId, {
          count: inserted?.length || 0,
        })

        return jsonResponse({
          imported: inserted?.length || 0,
          cohort_api_key: cohortKey,
          message: 'Save the cohort API key — it will not be shown again.',
        }, 201)
      }

      if (action === 'suspend' || action === 'reactivate') {
        const { student_id } = body
        if (!student_id) return errorResponse(ErrorCode.VALIDATION_ERROR, 'student_id required', 400)

        const newStatus = action === 'suspend' ? 'suspended' : 'active'
        const { error } = await auth.adminClient
          .from('edu_students')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', student_id)
          .eq('organization_id', auth.orgId)

        if (error) throw error

        await logAuditEvent(auth.adminClient, auth.orgId, 'student', action, student_id, auth.userId)

        return jsonResponse({ success: true, status: newStatus })
      }

      return errorResponse(ErrorCode.VALIDATION_ERROR, 'Unknown action', 400)
    }

    return errorResponse(ErrorCode.METHOD_NOT_ALLOWED, 'Method not allowed', 405)
  } catch (error) {
    console.error('education-students error:', error)
    return errorResponse(ErrorCode.INTERNAL_ERROR, 'Internal server error', 500)
  }
})
