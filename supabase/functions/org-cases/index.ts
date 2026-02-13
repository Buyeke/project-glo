import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS',
}

async function authenticate(req: Request): Promise<{ orgId: string; userId?: string } | null> {
  const adminClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const apiKey = req.headers.get('x-api-key')
  if (apiKey) {
    const encoder = new TextEncoder()
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(apiKey))
    const keyHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')

    const { data: orgId } = await adminClient.rpc('validate_api_key', { p_key_hash: keyHash })
    if (orgId) {
      const { data: keyData } = await adminClient
        .from('organization_api_keys')
        .select('scopes')
        .eq('key_hash', keyHash)
        .single()

      const scopes = keyData?.scopes || []
      const method = req.method
      const needsWrite = ['POST', 'PUT', 'DELETE'].includes(method)
      
      if (needsWrite && !scopes.includes('cases:write')) return null
      if (!needsWrite && !scopes.includes('cases:read')) return null

      return { orgId }
    }
  }

  const authHeader = req.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: claims, error } = await supabase.auth.getClaims(authHeader.replace('Bearer ', ''))
    if (error || !claims?.claims?.sub) return null

    const userId = claims.claims.sub
    const url = new URL(req.url)
    const orgId = url.searchParams.get('org_id')
    if (!orgId) return null

    const { data: membership } = await adminClient
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', userId)
      .single()

    if (!membership) return null
    return { orgId, userId }
  }

  return null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const auth = await authenticate(req)
    if (!auth) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const url = new URL(req.url)
    const caseId = url.searchParams.get('id')
    const action = url.searchParams.get('action')

    // GET: List cases or get single case with notes
    if (req.method === 'GET') {
      if (caseId) {
        // Get single case with notes
        const { data: caseData, error } = await adminClient
          .from('org_cases')
          .select('*')
          .eq('id', caseId)
          .eq('organization_id', auth.orgId)
          .single()

        if (error) throw error

        const { data: notes } = await adminClient
          .from('org_case_notes')
          .select('*')
          .eq('case_id', caseId)
          .eq('organization_id', auth.orgId)
          .order('created_at', { ascending: false })

        return new Response(JSON.stringify({ case: caseData, notes: notes || [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // List cases
      const status = url.searchParams.get('status')
      const priority = url.searchParams.get('priority')
      const category = url.searchParams.get('category')
      const assigned = url.searchParams.get('assigned_to')
      const search = url.searchParams.get('search')
      const limit = parseInt(url.searchParams.get('limit') || '50')
      const offset = parseInt(url.searchParams.get('offset') || '0')

      let query = adminClient
        .from('org_cases')
        .select('*', { count: 'exact' })
        .eq('organization_id', auth.orgId)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false })

      if (status) query = query.eq('status', status)
      if (priority) query = query.eq('priority', priority)
      if (category) query = query.eq('category', category)
      if (assigned) query = query.eq('assigned_to', assigned)
      if (search) query = query.or(`client_name.ilike.%${search}%,case_number.ilike.%${search}%,description.ilike.%${search}%`)

      const { data, count, error } = await query
      if (error) throw error

      return new Response(JSON.stringify({ cases: data, total: count }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // POST: Create case or add note
    if (req.method === 'POST') {
      const body = await req.json()

      if (action === 'add-note') {
        if (!caseId || !body.content) {
          return new Response(JSON.stringify({ error: 'case id and content are required' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { data, error } = await adminClient
          .from('org_case_notes')
          .insert({
            case_id: caseId,
            organization_id: auth.orgId,
            content: body.content,
            note_type: body.note_type || 'general',
            created_by: auth.userId || null,
          })
          .select()
          .single()

        if (error) throw error

        // Log activity
        await adminClient.from('org_activity_log').insert({
          organization_id: auth.orgId,
          activity_type: 'case_note_added',
          entity_type: 'case_note',
          entity_id: data.id,
          metadata: { case_id: caseId },
          performed_by: auth.userId || null,
        })

        return new Response(JSON.stringify({ note: data }), {
          status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Create new case
      if (!body.case_number) {
        // Auto-generate case number
        const { count } = await adminClient
          .from('org_cases')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', auth.orgId)

        body.case_number = `CASE-${String((count || 0) + 1).padStart(5, '0')}`
      }

      const { data, error } = await adminClient
        .from('org_cases')
        .insert({
          organization_id: auth.orgId,
          case_number: body.case_number,
          client_name: body.client_name || null,
          client_identifier: body.client_identifier || null,
          status: body.status || 'open',
          priority: body.priority || 'medium',
          category: body.category || 'general',
          description: body.description || null,
          assigned_to: body.assigned_to || null,
          tags: body.tags || [],
          metadata: body.metadata || {},
          created_by: auth.userId || null,
        })
        .select()
        .single()

      if (error) throw error

      // Log activity
      await adminClient.from('org_activity_log').insert({
        organization_id: auth.orgId,
        activity_type: 'case_created',
        entity_type: 'case',
        entity_id: data.id,
        performed_by: auth.userId || null,
      })

      return new Response(JSON.stringify({ case: data }), {
        status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // PUT: Update case
    if (req.method === 'PUT') {
      if (!caseId) {
        return new Response(JSON.stringify({ error: 'id is required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const updates = await req.json()
      const allowedFields = ['client_name', 'client_identifier', 'status', 'priority', 'category', 'description', 'assigned_to', 'tags', 'metadata', 'closed_at']
      const filtered: Record<string, unknown> = { updated_at: new Date().toISOString() }
      for (const key of allowedFields) {
        if (updates[key] !== undefined) filtered[key] = updates[key]
      }

      // Auto-set closed_at when status changes to closed
      if (updates.status === 'closed' && !updates.closed_at) {
        filtered.closed_at = new Date().toISOString()
      }

      const { data, error } = await adminClient
        .from('org_cases')
        .update(filtered)
        .eq('id', caseId)
        .eq('organization_id', auth.orgId)
        .select()
        .single()

      if (error) throw error

      // Log activity
      await adminClient.from('org_activity_log').insert({
        organization_id: auth.orgId,
        activity_type: 'case_updated',
        entity_type: 'case',
        entity_id: caseId,
        metadata: { updated_fields: Object.keys(filtered) },
        performed_by: auth.userId || null,
      })

      return new Response(JSON.stringify({ case: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // DELETE: Close case (soft delete)
    if (req.method === 'DELETE') {
      if (!caseId) {
        return new Response(JSON.stringify({ error: 'id is required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      await adminClient
        .from('org_cases')
        .update({ status: 'archived', updated_at: new Date().toISOString() })
        .eq('id', caseId)
        .eq('organization_id', auth.orgId)

      await adminClient.from('org_activity_log').insert({
        organization_id: auth.orgId,
        activity_type: 'case_archived',
        entity_type: 'case',
        entity_id: caseId,
        performed_by: auth.userId || null,
      })

      return new Response(JSON.stringify({ message: 'Case archived' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('org-cases error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
