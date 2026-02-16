import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

// Shared auth helper: validates API key or JWT, returns org context
async function authenticateRequest(req: Request) {
  const adminClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Try API key auth first
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
      // Verify org is education tier
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

  // Fall back to JWT auth
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: claims, error } = await supabase.auth.getClaims(
    authHeader.replace('Bearer ', '')
  )
  if (error || !claims?.claims?.sub) return null

  const userId = claims.claims.sub as string

  // Find user's education org membership
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

    // GET: list students or export
    if (req.method === 'GET') {
      if (action === 'export') {
        const { data: students } = await auth.adminClient
          .from('edu_students')
          .select('student_id_external, name, email, status, ethics_certified, last_active_at, created_at')
          .eq('organization_id', auth.orgId)
          .order('name')

        // CSV format
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

      // Default: list students
      const semesterId = url.searchParams.get('semester_id')
      let query = auth.adminClient
        .from('edu_students')
        .select('*')
        .eq('organization_id', auth.orgId)
        .order('name')

      if (semesterId) {
        query = query.eq('semester_id', semesterId)
      }

      const { data: students, error } = await query
      if (error) throw error

      return new Response(JSON.stringify({ students: students || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // POST actions
    if (req.method === 'POST') {
      const body = await req.json()

      if (action === 'import') {
        // Bulk import students
        const { students, semester_id } = body
        if (!students || !Array.isArray(students) || !semester_id) {
          return new Response(JSON.stringify({ error: 'Required: students array and semester_id' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Check capacity
        const { data: semester } = await auth.adminClient
          .from('edu_semesters')
          .select('student_capacity')
          .eq('id', semester_id)
          .eq('organization_id', auth.orgId)
          .single()

        if (!semester) {
          return new Response(JSON.stringify({ error: 'Semester not found' }), {
            status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { count: existingCount } = await auth.adminClient
          .from('edu_students')
          .select('id', { count: 'exact', head: true })
          .eq('semester_id', semester_id)

        if ((existingCount || 0) + students.length > semester.student_capacity) {
          return new Response(JSON.stringify({
            error: `Capacity exceeded. Capacity: ${semester.student_capacity}, current: ${existingCount}, importing: ${students.length}`
          }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        // Generate shared cohort API key hash
        const cohortKey = `glo_stu_${crypto.randomUUID().replace(/-/g, '')}`
        const encoder = new TextEncoder()
        const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(cohortKey))
        const keyHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')

        const importResults = { imported: 0, errors: [] as string[] }

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
          importResults.errors.push(insertError.message)
        } else {
          importResults.imported = inserted?.length || 0
        }

        return new Response(JSON.stringify({
          ...importResults,
          cohort_api_key: cohortKey,
          message: 'Save the cohort API key — it will not be shown again.',
        }), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (action === 'suspend') {
        const { student_id } = body
        if (!student_id) {
          return new Response(JSON.stringify({ error: 'student_id required' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { error } = await auth.adminClient
          .from('edu_students')
          .update({ status: 'suspended', updated_at: new Date().toISOString() })
          .eq('id', student_id)
          .eq('organization_id', auth.orgId)

        if (error) throw error

        return new Response(JSON.stringify({ success: true, status: 'suspended' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (action === 'reactivate') {
        const { student_id } = body
        if (!student_id) {
          return new Response(JSON.stringify({ error: 'student_id required' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { error } = await auth.adminClient
          .from('edu_students')
          .update({ status: 'active', updated_at: new Date().toISOString() })
          .eq('id', student_id)
          .eq('organization_id', auth.orgId)

        if (error) throw error

        return new Response(JSON.stringify({ success: true, status: 'active' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ error: 'Unknown action' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('education-students error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
