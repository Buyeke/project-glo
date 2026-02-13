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
    if (orgId) return { orgId }
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

// Public submission endpoint - no auth required, validates form exists and is public
async function handlePublicSubmission(req: Request): Promise<Response> {
  const adminClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const body = await req.json()
  const { form_id, responses, submitter_name, submitter_contact, source } = body

  if (!form_id || !responses) {
    return new Response(JSON.stringify({ error: 'form_id and responses are required' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Validate form exists, is active, and is public
  const { data: form, error: formError } = await adminClient
    .from('org_intake_forms')
    .select('id, organization_id, form_schema, is_active, is_public')
    .eq('id', form_id)
    .single()

  if (formError || !form) {
    return new Response(JSON.stringify({ error: 'Form not found' }), {
      status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  if (!form.is_active || !form.is_public) {
    return new Response(JSON.stringify({ error: 'Form is not available' }), {
      status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Validate required fields from form schema
  const schema = form.form_schema as any[]
  for (const field of schema) {
    if (field.required && (!responses[field.name] || responses[field.name] === '')) {
      return new Response(JSON.stringify({ error: `Field '${field.label || field.name}' is required` }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
  }

  const { data, error } = await adminClient
    .from('org_intake_submissions')
    .insert({
      form_id,
      organization_id: form.organization_id,
      responses,
      submitter_name: submitter_name || null,
      submitter_contact: submitter_contact || null,
      source: source || 'widget',
      status: 'new',
    })
    .select()
    .single()

  if (error) throw error

  // Log activity
  await adminClient.from('org_activity_log').insert({
    organization_id: form.organization_id,
    activity_type: 'intake_submitted',
    entity_type: 'intake_submission',
    entity_id: data.id,
    metadata: { form_id, source: source || 'widget' },
  })

  return new Response(JSON.stringify({
    submission_id: data.id,
    message: 'Submission received successfully',
  }), {
    status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    // Public submission endpoint
    if (req.method === 'POST' && action === 'submit') {
      return await handlePublicSubmission(req)
    }

    // All other endpoints require auth
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

    const entityType = url.searchParams.get('entity') || 'forms' // 'forms' or 'submissions'
    const entityId = url.searchParams.get('id')

    // ==================
    // FORMS MANAGEMENT
    // ==================
    if (entityType === 'forms') {
      if (req.method === 'GET') {
        if (entityId) {
          const { data, error } = await adminClient
            .from('org_intake_forms')
            .select('*')
            .eq('id', entityId)
            .eq('organization_id', auth.orgId)
            .single()

          if (error) throw error
          return new Response(JSON.stringify({ form: data }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { data, count, error } = await adminClient
          .from('org_intake_forms')
          .select('*', { count: 'exact' })
          .eq('organization_id', auth.orgId)
          .order('created_at', { ascending: false })

        if (error) throw error
        return new Response(JSON.stringify({ forms: data, total: count }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (req.method === 'POST') {
        const body = await req.json()
        if (!body.title) {
          return new Response(JSON.stringify({ error: 'title is required' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const { data, error } = await adminClient
          .from('org_intake_forms')
          .insert({
            organization_id: auth.orgId,
            title: body.title,
            description: body.description || null,
            form_schema: body.form_schema || [],
            is_active: body.is_active !== false,
            is_public: body.is_public || false,
            settings: body.settings || {},
            created_by: auth.userId || null,
          })
          .select()
          .single()

        if (error) throw error

        await adminClient.from('org_activity_log').insert({
          organization_id: auth.orgId,
          activity_type: 'intake_form_created',
          entity_type: 'intake_form',
          entity_id: data.id,
          performed_by: auth.userId || null,
        })

        return new Response(JSON.stringify({ form: data }), {
          status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (req.method === 'PUT') {
        if (!entityId) {
          return new Response(JSON.stringify({ error: 'id is required' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const updates = await req.json()
        const allowedFields = ['title', 'description', 'form_schema', 'is_active', 'is_public', 'settings']
        const filtered: Record<string, unknown> = { updated_at: new Date().toISOString() }
        for (const key of allowedFields) {
          if (updates[key] !== undefined) filtered[key] = updates[key]
        }

        const { data, error } = await adminClient
          .from('org_intake_forms')
          .update(filtered)
          .eq('id', entityId)
          .eq('organization_id', auth.orgId)
          .select()
          .single()

        if (error) throw error
        return new Response(JSON.stringify({ form: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (req.method === 'DELETE') {
        if (!entityId) {
          return new Response(JSON.stringify({ error: 'id is required' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        await adminClient
          .from('org_intake_forms')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('id', entityId)
          .eq('organization_id', auth.orgId)

        return new Response(JSON.stringify({ message: 'Form deactivated' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // =======================
    // SUBMISSIONS MANAGEMENT
    // =======================
    if (entityType === 'submissions') {
      if (req.method === 'GET') {
        if (entityId) {
          const { data, error } = await adminClient
            .from('org_intake_submissions')
            .select('*, org_intake_forms(title)')
            .eq('id', entityId)
            .eq('organization_id', auth.orgId)
            .single()

          if (error) throw error
          return new Response(JSON.stringify({ submission: data }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const formId = url.searchParams.get('form_id')
        const status = url.searchParams.get('status')
        const limit = parseInt(url.searchParams.get('limit') || '50')
        const offset = parseInt(url.searchParams.get('offset') || '0')

        let query = adminClient
          .from('org_intake_submissions')
          .select('*, org_intake_forms(title)', { count: 'exact' })
          .eq('organization_id', auth.orgId)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (formId) query = query.eq('form_id', formId)
        if (status) query = query.eq('status', status)

        const { data, count, error } = await query
        if (error) throw error

        return new Response(JSON.stringify({ submissions: data, total: count }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (req.method === 'PUT') {
        if (!entityId) {
          return new Response(JSON.stringify({ error: 'id is required' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const updates = await req.json()
        const allowedFields = ['status', 'priority', 'assigned_case_id', 'metadata']
        const filtered: Record<string, unknown> = { updated_at: new Date().toISOString() }
        for (const key of allowedFields) {
          if (updates[key] !== undefined) filtered[key] = updates[key]
        }

        const { data, error } = await adminClient
          .from('org_intake_submissions')
          .update(filtered)
          .eq('id', entityId)
          .eq('organization_id', auth.orgId)
          .select()
          .single()

        if (error) throw error

        // If assigning to a case, log it
        if (updates.assigned_case_id) {
          await adminClient.from('org_activity_log').insert({
            organization_id: auth.orgId,
            activity_type: 'intake_assigned_to_case',
            entity_type: 'intake_submission',
            entity_id: entityId,
            metadata: { case_id: updates.assigned_case_id },
            performed_by: auth.userId || null,
          })
        }

        return new Response(JSON.stringify({ submission: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('org-intake error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
