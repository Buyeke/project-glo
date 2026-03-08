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

    // --- GET actions ---
    if (req.method === 'GET') {
      const scopeErr = requireScope(auth, 'education:read')
      if (scopeErr) return scopeErr

      if (action === 'list' || !action) {
        const pagination = parsePagination(url)

        let countQuery = auth.adminClient
          .from('edu_projects')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', auth.orgId)

        let query = auth.adminClient
          .from('edu_projects')
          .select('*, edu_students(name, student_id_external), edu_assignments(title)')
          .eq('organization_id', auth.orgId)
          .order('updated_at', { ascending: false })
          .range(pagination.offset, pagination.offset + pagination.limit - 1)

        if (!isFaculty(auth.role) && auth.studentId) {
          query = query.eq('student_id', auth.studentId)
          countQuery = countQuery.eq('student_id', auth.studentId)
        }

        const statusFilter = url.searchParams.get('status')
        if (statusFilter) {
          query = query.eq('status', statusFilter)
          countQuery = countQuery.eq('status', statusFilter)
        }

        const assignmentFilter = url.searchParams.get('assignment_id')
        if (assignmentFilter) {
          query = query.eq('assignment_id', assignmentFilter)
          countQuery = countQuery.eq('assignment_id', assignmentFilter)
        }

        const [{ data }, { count }] = await Promise.all([query, countQuery])
        return paginatedResponse(data || [], count || 0, pagination)
      }

      if (action === 'detail') {
        const projectId = url.searchParams.get('project_id')
        if (!projectId) return errorResponse(ErrorCode.VALIDATION_ERROR, 'project_id required', 400)

        let query = auth.adminClient
          .from('edu_projects')
          .select('*, edu_students(name, student_id_external, email), edu_assignments(title, description, deadline)')
          .eq('id', projectId)
          .eq('organization_id', auth.orgId)

        if (!isFaculty(auth.role) && auth.studentId) {
          query = query.eq('student_id', auth.studentId)
        }

        const { data, error } = await query.single()
        if (error || !data) return errorResponse(ErrorCode.NOT_FOUND, 'Project not found', 404)

        return jsonResponse(data)
      }

      return errorResponse(ErrorCode.VALIDATION_ERROR, 'Unknown GET action', 400)
    }

    // --- POST actions ---
    if (req.method === 'POST') {
      const body = await req.json()

      // Create project (student)
      if (action === 'create') {
        const scopeErr = requireScope(auth, 'projects:write')
        if (scopeErr) return scopeErr

        if (!auth.studentId) return errorResponse(ErrorCode.FORBIDDEN, 'Student identity required', 403)

        const { title, description, type, assignment_id, repo_url } = body
        if (!title) return errorResponse(ErrorCode.VALIDATION_ERROR, 'title required', 400)

        const { data, error } = await auth.adminClient
          .from('edu_projects')
          .insert({
            organization_id: auth.orgId,
            student_id: auth.studentId,
            title,
            description: description || null,
            type: type || 'analysis',
            assignment_id: assignment_id || null,
            repo_url: repo_url || null,
            status: 'draft',
          })
          .select()
          .single()

        if (error) throw error

        await logAuditEvent(auth.adminClient, auth.orgId, 'project', 'created', data.id, auth.userId, { title })

        return jsonResponse(data, 201)
      }

      // Submit project (student)
      if (action === 'submit') {
        const { project_id } = body
        if (!project_id) return errorResponse(ErrorCode.VALIDATION_ERROR, 'project_id required', 400)

        const filter: Record<string, string> = { id: project_id, organization_id: auth.orgId }
        if (!isFaculty(auth.role)) filter.student_id = auth.studentId!

        const { error } = await auth.adminClient
          .from('edu_projects')
          .update({ status: 'submitted', submitted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .match(filter)

        if (error) throw error

        await logAuditEvent(auth.adminClient, auth.orgId, 'project', 'submitted', project_id, auth.userId)

        return jsonResponse({ success: true, status: 'submitted' })
      }

      // Review single project (faculty)
      if (action === 'review') {
        if (!isFaculty(auth.role)) return errorResponse(ErrorCode.FORBIDDEN, 'Faculty role required', 403)

        const writeErr = requireScope(auth, 'education:write')
        if (writeErr) return writeErr

        const { project_id, grade, faculty_comments, status } = body
        if (!project_id) return errorResponse(ErrorCode.VALIDATION_ERROR, 'project_id required', 400)

        const updates: Record<string, unknown> = { updated_at: new Date().toISOString(), reviewed_at: new Date().toISOString() }
        if (grade) updates.grade = grade
        if (faculty_comments) updates.faculty_comments = faculty_comments
        if (status) updates.status = status

        const { error } = await auth.adminClient
          .from('edu_projects')
          .update(updates)
          .eq('id', project_id)
          .eq('organization_id', auth.orgId)

        if (error) throw error

        await logAuditEvent(auth.adminClient, auth.orgId, 'project', 'reviewed', project_id, auth.userId, { grade, status })

        return jsonResponse({ success: true })
      }

      // Batch review/grade (faculty)
      if (action === 'batch-review') {
        if (!isFaculty(auth.role)) return errorResponse(ErrorCode.FORBIDDEN, 'Faculty role required', 403)

        const writeErr = requireScope(auth, 'education:write')
        if (writeErr) return writeErr

        const { reviews } = body
        if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
          return errorResponse(ErrorCode.VALIDATION_ERROR, 'reviews array required', 400)
        }

        if (reviews.length > 50) {
          return errorResponse(ErrorCode.VALIDATION_ERROR, 'Maximum 50 reviews per batch', 400)
        }

        const results: { project_id: string; success: boolean; error?: string }[] = []

        for (const review of reviews) {
          const { project_id, grade, faculty_comments, status } = review
          if (!project_id) {
            results.push({ project_id: 'unknown', success: false, error: 'project_id required' })
            continue
          }

          const updates: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
            reviewed_at: new Date().toISOString(),
          }
          if (grade) updates.grade = grade
          if (faculty_comments) updates.faculty_comments = faculty_comments
          if (status) updates.status = status || 'reviewed'

          const { error } = await auth.adminClient
            .from('edu_projects')
            .update(updates)
            .eq('id', project_id)
            .eq('organization_id', auth.orgId)

          if (error) {
            results.push({ project_id, success: false, error: error.message })
          } else {
            results.push({ project_id, success: true })
          }
        }

        await logAuditEvent(auth.adminClient, auth.orgId, 'project', 'batch_reviewed', undefined, auth.userId, {
          total: reviews.length,
          succeeded: results.filter(r => r.success).length,
        })

        return jsonResponse({
          results,
          summary: {
            total: results.length,
            succeeded: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
          },
        })
      }

      // Update project metadata (student updates draft)
      if (action === 'update') {
        const { project_id, title, description, repo_url, endpoints_used, datasets_used } = body
        if (!project_id) return errorResponse(ErrorCode.VALIDATION_ERROR, 'project_id required', 400)

        const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
        if (title) updates.title = title
        if (description !== undefined) updates.description = description
        if (repo_url !== undefined) updates.repo_url = repo_url
        if (endpoints_used) updates.endpoints_used = endpoints_used
        if (datasets_used) updates.datasets_used = datasets_used

        const filter: Record<string, string> = { id: project_id, organization_id: auth.orgId }
        if (!isFaculty(auth.role)) {
          filter.student_id = auth.studentId!
          filter.status = 'draft'
        }

        const { error } = await auth.adminClient
          .from('edu_projects')
          .update(updates)
          .match(filter)

        if (error) throw error

        return jsonResponse({ success: true })
      }

      return errorResponse(ErrorCode.VALIDATION_ERROR, 'Unknown action', 400)
    }

    return errorResponse(ErrorCode.METHOD_NOT_ALLOWED, 'Method not allowed', 405)
  } catch (error) {
    console.error('education-projects error:', error)
    return errorResponse(ErrorCode.INTERNAL_ERROR, 'Internal server error', 500)
  }
})
