import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

async function authenticateFaculty(req: Request) {
  const adminClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // API key auth
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
        // API key callers need education:admin scope for rate limit management
        const scopes = keyRecord.scopes as string[]
        if (!scopes.includes('education:admin')) {
          return null // Student keys can't manage rate limits
        }
        return { orgId: org.id, org, adminClient }
      }
    }
  }

  // JWT auth
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
    .in('role', ['owner', 'admin', 'faculty'])
    .single()

  if (!membership) return null

  const { data: org } = await adminClient
    .from('organizations')
    .select('id, tier, settings')
    .eq('id', membership.organization_id)
    .eq('tier', 'education')
    .single()

  if (!org) return null
  return { orgId: org.id, org, adminClient }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const auth = await authenticateFaculty(req)
    if (!auth) {
      return new Response(JSON.stringify({ error: 'Unauthorized. Faculty role required.' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    // GET actions
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

        if (!semester) {
          return new Response(JSON.stringify({ error: 'No active semester found' }), {
            status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Get student overrides
        const { data: overrides } = await auth.adminClient
          .from('edu_students')
          .select('id, name, student_id_external, rate_limit_override')
          .eq('semester_id', semester.id)
          .not('rate_limit_override', 'is', null)

        return new Response(JSON.stringify({
          semester,
          student_overrides: overrides || [],
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (action === 'list-semesters') {
        const { data: semesters } = await auth.adminClient
          .from('edu_semesters')
          .select('*')
          .eq('organization_id', auth.orgId)
          .order('start_date', { ascending: false })

        return new Response(JSON.stringify({ semesters: semesters || [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ error: 'Unknown action. Use: current, list-semesters' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // POST actions
    if (req.method === 'POST') {
      const body = await req.json()

      if (action === 'update-semester') {
        const { semester_id, rate_limit_normal, rate_limit_assignment, rate_limit_off_semester } = body
        if (!semester_id) {
          return new Response(JSON.stringify({ error: 'semester_id required' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const settings: Record<string, number> = {}
        if (rate_limit_normal !== undefined) settings.rate_limit_normal = rate_limit_normal
        if (rate_limit_assignment !== undefined) settings.rate_limit_assignment = rate_limit_assignment
        if (rate_limit_off_semester !== undefined) settings.rate_limit_off_semester = rate_limit_off_semester

        // Merge with existing settings
        const { data: existing } = await auth.adminClient
          .from('edu_semesters')
          .select('settings')
          .eq('id', semester_id)
          .eq('organization_id', auth.orgId)
          .single()

        if (!existing) {
          return new Response(JSON.stringify({ error: 'Semester not found' }), {
            status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const mergedSettings = { ...(existing.settings as Record<string, unknown>), ...settings }

        const { error } = await auth.adminClient
          .from('edu_semesters')
          .update({ settings: mergedSettings, updated_at: new Date().toISOString() })
          .eq('id', semester_id)
          .eq('organization_id', auth.orgId)

        if (error) throw error

        return new Response(JSON.stringify({ success: true, settings: mergedSettings }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (action === 'student-override') {
        const { student_id, daily_limit } = body
        if (!student_id || daily_limit === undefined) {
          return new Response(JSON.stringify({ error: 'student_id and daily_limit required' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { error } = await auth.adminClient
          .from('edu_students')
          .update({ rate_limit_override: daily_limit, updated_at: new Date().toISOString() })
          .eq('id', student_id)
          .eq('organization_id', auth.orgId)

        if (error) throw error

        return new Response(JSON.stringify({ success: true, student_id, rate_limit_override: daily_limit }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (action === 'clear-override') {
        const { student_id } = body
        if (!student_id) {
          return new Response(JSON.stringify({ error: 'student_id required' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { error } = await auth.adminClient
          .from('edu_students')
          .update({ rate_limit_override: null, updated_at: new Date().toISOString() })
          .eq('id', student_id)
          .eq('organization_id', auth.orgId)

        if (error) throw error

        return new Response(JSON.stringify({ success: true, student_id, rate_limit_override: null }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (action === 'create-semester') {
        const { name, start_date, end_date, student_capacity = 40, rate_limit_normal = 100, rate_limit_assignment = 500, rate_limit_off_semester = 0 } = body
        if (!name || !start_date || !end_date) {
          return new Response(JSON.stringify({ error: 'name, start_date, end_date required' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
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

        return new Response(JSON.stringify({ success: true, semester }), {
          status: 201,
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
    console.error('education-rate-limits error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
