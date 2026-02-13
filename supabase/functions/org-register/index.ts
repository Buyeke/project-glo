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

    const userId = claims.claims.sub

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { name, slug, contact_email, contact_phone, website, description } = await req.json()

    if (!name || !slug || !contact_email) {
      return new Response(JSON.stringify({ error: 'name, slug, and contact_email are required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return new Response(JSON.stringify({ error: 'Slug must contain only lowercase letters, numbers, and hyphens' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Create organization
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
      })
      .select()
      .single()

    if (orgError) {
      if (orgError.code === '23505') {
        return new Response(JSON.stringify({ error: 'An organization with this slug already exists' }), {
          status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      throw orgError
    }

    // Add owner as org member
    await adminClient.from('organization_members').insert({
      organization_id: org.id,
      user_id: userId,
      role: 'owner',
    })

    // Generate API key
    const rawKey = `glo_${crypto.randomUUID().replace(/-/g, '')}`
    const keyPrefix = rawKey.substring(0, 12)
    const encoder = new TextEncoder()
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(rawKey))
    const keyHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')

    await adminClient.from('organization_api_keys').insert({
      organization_id: org.id,
      key_hash: keyHash,
      key_prefix: keyPrefix,
      name: 'Default API Key',
      scopes: ['knowledge_base:read', 'knowledge_base:write', 'widget:embed', 'cases:read', 'cases:write', 'reports:read'],
      created_by: userId,
    })

    return new Response(JSON.stringify({
      organization: org,
      api_key: rawKey,
      message: 'Organization created. Save your API key — it will not be shown again.',
    }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('org-register error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
