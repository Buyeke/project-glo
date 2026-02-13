import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, DELETE, OPTIONS',
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
    const url = new URL(req.url)
    const orgId = url.searchParams.get('org_id')

    if (!orgId) {
      return new Response(JSON.stringify({ error: 'org_id is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Verify user is org owner/admin
    const { data: membership } = await adminClient
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', userId)
      .single()

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // GET: List API keys
    if (req.method === 'GET') {
      const { data: keys } = await adminClient
        .from('organization_api_keys')
        .select('id, key_prefix, name, scopes, is_active, last_used_at, expires_at, created_at')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })

      return new Response(JSON.stringify({ keys }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // POST: Create new API key
    if (req.method === 'POST') {
      const { name, scopes } = await req.json()

      const rawKey = `glo_${crypto.randomUUID().replace(/-/g, '')}`
      const keyPrefix = rawKey.substring(0, 12)
      const encoder = new TextEncoder()
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(rawKey))
      const keyHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')

      const validScopes = ['knowledge_base:read', 'knowledge_base:write', 'widget:embed', 'cases:read', 'cases:write', 'reports:read']
      const filteredScopes = (scopes || validScopes).filter((s: string) => validScopes.includes(s))

      await adminClient.from('organization_api_keys').insert({
        organization_id: orgId,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        name: name || 'API Key',
        scopes: filteredScopes,
        created_by: userId,
      })

      return new Response(JSON.stringify({
        api_key: rawKey,
        key_prefix: keyPrefix,
        message: 'Save your API key — it will not be shown again.',
      }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // DELETE: Revoke API key
    if (req.method === 'DELETE') {
      const keyId = url.searchParams.get('key_id')
      if (!keyId) {
        return new Response(JSON.stringify({ error: 'key_id is required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      await adminClient
        .from('organization_api_keys')
        .update({ is_active: false })
        .eq('id', keyId)
        .eq('organization_id', orgId)

      return new Response(JSON.stringify({ message: 'API key revoked' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('org-api-keys error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
