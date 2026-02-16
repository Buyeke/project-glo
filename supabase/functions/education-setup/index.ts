import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Authenticate via JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: claims, error: claimsError } = await supabase.auth.getClaims(
      authHeader.replace('Bearer ', '')
    )
    if (claimsError || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const userId = claims.claims.sub as string

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const body = await req.json()
    const {
      name, slug, contact_email, contact_phone, website, description,
      semester_name, semester_start, semester_end,
      student_capacity = 40,
      sandbox_enabled = true,
      anonymization_enabled = true,
      rate_limit_normal = 100,
      rate_limit_assignment = 500,
      rate_limit_off_semester = 0,
    } = body

    // Validate required fields
    if (!name || !slug || !contact_email || !semester_start || !semester_end) {
      return new Response(JSON.stringify({
        error: 'Required: name, slug, contact_email, semester_start, semester_end'
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      return new Response(JSON.stringify({ error: 'Slug must be lowercase alphanumeric with hyphens' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Create or update organization with education tier
    const educationSettings = {
      sandbox_enabled,
      anonymization_enabled,
      student_capacity,
      rate_limits: {
        normal: rate_limit_normal,
        assignment: rate_limit_assignment,
        off_semester: rate_limit_off_semester,
      }
    }

    // Check if org with this slug already exists
    const { data: existingOrg } = await adminClient
      .from('organizations')
      .select('id, tier')
      .eq('slug', slug)
      .single()

    let orgId: string

    if (existingOrg) {
      // Update existing org to education tier
      const { error: updateError } = await adminClient
        .from('organizations')
        .update({
          tier: 'education',
          settings: educationSettings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingOrg.id)

      if (updateError) throw updateError
      orgId = existingOrg.id
    } else {
      // Create new education org
      const { data: org, error: orgError } = await adminClient
        .from('organizations')
        .insert({
          name,
          slug,
          contact_email,
          contact_phone: contact_phone || null,
          website: website || null,
          description: description || null,
          owner_user_id: userId,
          tier: 'education',
          settings: educationSettings,
        })
        .select()
        .single()

      if (orgError) {
        if (orgError.code === '23505') {
          return new Response(JSON.stringify({ error: 'Organization slug already exists' }), {
            status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        throw orgError
      }
      orgId = org.id

      // Add owner as org member with faculty role
      await adminClient.from('organization_members').insert({
        organization_id: orgId,
        user_id: userId,
        role: 'owner',
      })
    }

    // Auto-create first semester
    const { data: semester, error: semesterError } = await adminClient
      .from('edu_semesters')
      .insert({
        organization_id: orgId,
        name: semester_name || `Semester ${new Date().getFullYear()}`,
        start_date: semester_start,
        end_date: semester_end,
        student_capacity,
        is_active: true,
        settings: {
          rate_limit_normal,
          rate_limit_assignment,
          rate_limit_off_semester,
        }
      })
      .select()
      .single()

    if (semesterError) throw semesterError

    // Generate cohort API key
    const rawKey = `glo_edu_${crypto.randomUUID().replace(/-/g, '')}`
    const keyPrefix = rawKey.substring(0, 16)
    const encoder = new TextEncoder()
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(rawKey))
    const keyHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')

    await adminClient.from('organization_api_keys').insert({
      organization_id: orgId,
      key_hash: keyHash,
      key_prefix: keyPrefix,
      name: 'Education Cohort API Key',
      scopes: ['education:read', 'sandbox:read', 'docs:read'],
      created_by: userId,
    })

    return new Response(JSON.stringify({
      organization_id: orgId,
      semester: semester,
      api_key: rawKey,
      settings: educationSettings,
      message: 'Education organization created. Save the API key — it will not be shown again.',
    }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('education-setup error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
