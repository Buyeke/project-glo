import {
  authenticateEducationRequest, corsHeaders,
  errorResponse, jsonResponse,
  ErrorCode,
} from '../_shared/edu-auth.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const auth = await authenticateEducationRequest(req)
    if (!auth) return errorResponse(ErrorCode.UNAUTHORIZED, 'Unauthorized', 401)

    // GET: check ethics status
    if (req.method === 'GET') {
      if (!auth.studentId) return errorResponse(ErrorCode.FORBIDDEN, 'Student identity required', 403)

      const { data: student } = await auth.adminClient
        .from('edu_students')
        .select('id, ethics_certified, ethics_certified_at, ethics_cert_id, ethics_quiz_score')
        .eq('id', auth.studentId)
        .single()

      if (!student) return errorResponse(ErrorCode.NOT_FOUND, 'Student not found', 404)

      return jsonResponse({
        student_id: student.id,
        ethics_certified: student.ethics_certified,
        ethics_certified_at: student.ethics_certified_at,
        ethics_cert_id: student.ethics_cert_id,
        ethics_quiz_score: student.ethics_quiz_score,
      })
    }

    // POST: submit ethics certification
    if (req.method === 'POST') {
      if (!auth.studentId) return errorResponse(ErrorCode.FORBIDDEN, 'Student identity required', 403)

      const { quiz_score, cert_id } = await req.json()

      if (quiz_score === undefined || !cert_id) {
        return errorResponse(ErrorCode.VALIDATION_ERROR, 'Required: quiz_score, cert_id', 400)
      }

      const { data: org } = await auth.adminClient
        .from('organizations')
        .select('settings')
        .eq('id', auth.orgId)
        .single()

      const minScore = (org?.settings as Record<string, unknown>)?.ethics_min_score ?? 80

      if (quiz_score < (minScore as number)) {
        return errorResponse(ErrorCode.ETHICS_REQUIRED,
          'Quiz score below minimum threshold', 400,
          { minimum_required: minScore, your_score: quiz_score }
        )
      }

      const { error } = await auth.adminClient
        .from('edu_students')
        .update({
          ethics_certified: true,
          ethics_certified_at: new Date().toISOString(),
          ethics_cert_id: cert_id,
          ethics_quiz_score: quiz_score,
          updated_at: new Date().toISOString(),
        })
        .eq('id', auth.studentId)

      if (error) throw error

      return jsonResponse({
        success: true,
        ethics_certified: true,
        message: 'Ethics certification recorded. API access is now enabled.',
      })
    }

    return errorResponse(ErrorCode.METHOD_NOT_ALLOWED, 'Method not allowed', 405)
  } catch (error) {
    console.error('education-ethics error:', error)
    return errorResponse(ErrorCode.INTERNAL_ERROR, 'Internal server error', 500)
  }
})
