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

    // --- GET: list or detail ---
    if (req.method === 'GET') {
      if (action === 'detail') {
        const id = url.searchParams.get('assignment_id')
        if (!id) {
          return new Response(JSON.stringify({ error: 'assignment_id required' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { data, error } = await auth.adminClient
          .from('edu_assignments')
          .select('*, edu_semesters(name, start_date, end_date)')
          .eq('id', id)
          .eq('organization_id', auth.orgId)
          .single()

        if (error || !data) {
          return new Response(JSON.stringify({ error: 'Assignment not found' }), {
            status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Also get project count for this assignment
        const { count } = await auth.adminClient
          .from('edu_projects')
          .select('id', { count: 'exact', head: true })
          .eq('assignment_id', id)

        return new Response(JSON.stringify({ ...data, project_count: count || 0 }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Default: list assignments
      let query = auth.adminClient
        .from('edu_assignments')
        .select('*, edu_semesters(name)')
        .eq('organization_id', auth.orgId)
        .order('created_at', { ascending: false })

      const semesterId = url.searchParams.get('semester_id')
      if (semesterId) query = query.eq('semester_id', semesterId)

      const activeOnly = url.searchParams.get('active_only')
      if (activeOnly === 'true') query = query.eq('is_active', true)

      const { data, error } = await query
      if (error) throw error

      return new Response(JSON.stringify({ assignments: data || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // --- POST: faculty-only mutations ---
    if (req.method === 'POST') {
      if (!isFaculty(auth.role)) {
        return new Response(JSON.stringify({ error: 'Faculty role required' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const body = await req.json()

      // Create assignment
      if (action === 'create') {
        const { title, description, difficulty, semester_id, deadline, starter_query, rate_override_per_day } = body
        if (!title) {
          return new Response(JSON.stringify({ error: 'title required' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

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

        return new Response(JSON.stringify(data), {
          status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Update assignment
      if (action === 'update') {
        const { assignment_id, ...fields } = body
        if (!assignment_id) {
          return new Response(JSON.stringify({ error: 'assignment_id required' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const allowed = ['title', 'description', 'difficulty', 'deadline', 'starter_query', 'rate_override_per_day', 'is_active']
        const updates: any = { updated_at: new Date().toISOString() }
        for (const key of allowed) {
          if (fields[key] !== undefined) updates[key] = fields[key]
        }

        const { error } = await auth.adminClient
          .from('edu_assignments')
          .update(updates)
          .eq('id', assignment_id)
          .eq('organization_id', auth.orgId)

        if (error) throw error

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Activate / deactivate
      if (action === 'activate' || action === 'deactivate') {
        const { assignment_id } = body
        if (!assignment_id) {
          return new Response(JSON.stringify({ error: 'assignment_id required' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { error } = await auth.adminClient
          .from('edu_assignments')
          .update({ is_active: action === 'activate', updated_at: new Date().toISOString() })
          .eq('id', assignment_id)
          .eq('organization_id', auth.orgId)

        if (error) throw error

        return new Response(JSON.stringify({ success: true, is_active: action === 'activate' }), {
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
    console.error('education-assignments error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
