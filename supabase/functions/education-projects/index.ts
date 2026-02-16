import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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
        // Try to find the student associated with this API key
        const { data: student } = await adminClient
          .from('edu_students')
          .select('id, role, status, organization_id')
          .eq('api_key_hash', keyHash)
          .eq('status', 'active')
          .single()

        return {
          orgId: org.id, org, role: 'student',
          userId: null, studentId: student?.id || null, adminClient
        }
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

  // Check if user is also a student
  const { data: student } = await adminClient
    .from('edu_students')
    .select('id')
    .eq('user_id', userId)
    .eq('organization_id', org.id)
    .single()

  return {
    orgId: org.id, org, role: membership.role,
    userId, studentId: student?.id || null, adminClient
  }
}

function isFaculty(role: string) {
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

    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    // --- GET actions ---
    if (req.method === 'GET') {
      // List projects (faculty sees all, student sees own)
      if (action === 'list' || !action) {
        let query = auth.adminClient
          .from('edu_projects')
          .select('*, edu_students(name, student_id_external), edu_assignments(title)')
          .eq('organization_id', auth.orgId)
          .order('updated_at', { ascending: false })

        if (!isFaculty(auth.role) && auth.studentId) {
          query = query.eq('student_id', auth.studentId)
        }

        const statusFilter = url.searchParams.get('status')
        if (statusFilter) query = query.eq('status', statusFilter)

        const { data, error } = await query
        if (error) throw error

        return new Response(JSON.stringify({ projects: data || [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Get single project
      if (action === 'detail') {
        const projectId = url.searchParams.get('project_id')
        if (!projectId) {
          return new Response(JSON.stringify({ error: 'project_id required' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        let query = auth.adminClient
          .from('edu_projects')
          .select('*, edu_students(name, student_id_external, email), edu_assignments(title, description, deadline)')
          .eq('id', projectId)
          .eq('organization_id', auth.orgId)

        if (!isFaculty(auth.role) && auth.studentId) {
          query = query.eq('student_id', auth.studentId)
        }

        const { data, error } = await query.single()
        if (error || !data) {
          return new Response(JSON.stringify({ error: 'Project not found' }), {
            status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ error: 'Unknown GET action' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // --- POST actions ---
    if (req.method === 'POST') {
      const body = await req.json()

      // Create project (student)
      if (action === 'create') {
        if (!auth.studentId) {
          return new Response(JSON.stringify({ error: 'Student identity required' }), {
            status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { title, description, type, assignment_id, repo_url } = body
        if (!title) {
          return new Response(JSON.stringify({ error: 'title required' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

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

        return new Response(JSON.stringify(data), {
          status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Submit project (student)
      if (action === 'submit') {
        const { project_id } = body
        if (!project_id) {
          return new Response(JSON.stringify({ error: 'project_id required' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const filter: any = { id: project_id, organization_id: auth.orgId }
        if (!isFaculty(auth.role)) filter.student_id = auth.studentId

        const { error } = await auth.adminClient
          .from('edu_projects')
          .update({ status: 'submitted', submitted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .match(filter)

        if (error) throw error

        return new Response(JSON.stringify({ success: true, status: 'submitted' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Review project (faculty)
      if (action === 'review') {
        if (!isFaculty(auth.role)) {
          return new Response(JSON.stringify({ error: 'Faculty role required' }), {
            status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { project_id, grade, faculty_comments, status } = body
        if (!project_id) {
          return new Response(JSON.stringify({ error: 'project_id required' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const updates: any = { updated_at: new Date().toISOString(), reviewed_at: new Date().toISOString() }
        if (grade) updates.grade = grade
        if (faculty_comments) updates.faculty_comments = faculty_comments
        if (status) updates.status = status // e.g. 'reviewed', 'returned'

        const { error } = await auth.adminClient
          .from('edu_projects')
          .update(updates)
          .eq('id', project_id)
          .eq('organization_id', auth.orgId)

        if (error) throw error

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Update project metadata (student updates draft)
      if (action === 'update') {
        const { project_id, title, description, repo_url, endpoints_used, datasets_used } = body
        if (!project_id) {
          return new Response(JSON.stringify({ error: 'project_id required' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const updates: any = { updated_at: new Date().toISOString() }
        if (title) updates.title = title
        if (description !== undefined) updates.description = description
        if (repo_url !== undefined) updates.repo_url = repo_url
        if (endpoints_used) updates.endpoints_used = endpoints_used
        if (datasets_used) updates.datasets_used = datasets_used

        const filter: any = { id: project_id, organization_id: auth.orgId }
        if (!isFaculty(auth.role)) {
          filter.student_id = auth.studentId
          filter.status = 'draft' // students can only update drafts
        }

        const { error } = await auth.adminClient
          .from('edu_projects')
          .update(updates)
          .match(filter)

        if (error) throw error

        return new Response(JSON.stringify({ success: true }), {
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
    console.error('education-projects error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
