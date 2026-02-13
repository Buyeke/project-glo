import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS',
}

// Authenticate via API key or JWT
async function authenticate(req: Request): Promise<{ orgId: string; userId?: string } | null> {
  const adminClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Try API key first
  const apiKey = req.headers.get('x-api-key')
  if (apiKey) {
    const encoder = new TextEncoder()
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(apiKey))
    const keyHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')

    const { data: orgId } = await adminClient.rpc('validate_api_key', { p_key_hash: keyHash })
    if (orgId) {
      // Check scope
      const { data: keyData } = await adminClient
        .from('organization_api_keys')
        .select('scopes')
        .eq('key_hash', keyHash)
        .single()

      const scopes = keyData?.scopes || []
      const method = req.method
      const needsWrite = ['POST', 'PUT', 'DELETE'].includes(method)
      
      if (needsWrite && !scopes.includes('knowledge_base:write')) {
        return null
      }
      if (!needsWrite && !scopes.includes('knowledge_base:read')) {
        return null
      }

      return { orgId }
    }
  }

  // Try JWT
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
    const entryId = url.searchParams.get('id')

    // GET: List/search knowledge base entries
    if (req.method === 'GET') {
      const category = url.searchParams.get('category')
      const language = url.searchParams.get('language')
      const search = url.searchParams.get('search')
      const limit = parseInt(url.searchParams.get('limit') || '50')
      const offset = parseInt(url.searchParams.get('offset') || '0')

      let query = adminClient
        .from('organization_knowledge_base')
        .select('*', { count: 'exact' })
        .eq('organization_id', auth.orgId)
        .eq('is_active', true)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false })

      if (category) query = query.eq('category', category)
      if (language) query = query.eq('language', language)
      if (search) query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)

      const { data, count, error } = await query

      if (error) throw error

      return new Response(JSON.stringify({ entries: data, total: count }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // POST: Create entry
    if (req.method === 'POST') {
      const { title, content, category, tags, language, metadata } = await req.json()

      if (!title || !content) {
        return new Response(JSON.stringify({ error: 'title and content are required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const { data, error } = await adminClient
        .from('organization_knowledge_base')
        .insert({
          organization_id: auth.orgId,
          title,
          content,
          category: category || 'general',
          tags: tags || [],
          language: language || 'en',
          metadata: metadata || {},
          created_by: auth.userId || null,
        })
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ entry: data }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // PUT: Update entry
    if (req.method === 'PUT') {
      if (!entryId) {
        return new Response(JSON.stringify({ error: 'id is required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const updates = await req.json()
      const allowedFields = ['title', 'content', 'category', 'tags', 'language', 'metadata', 'is_active']
      const filtered: Record<string, unknown> = { updated_at: new Date().toISOString() }
      for (const key of allowedFields) {
        if (updates[key] !== undefined) filtered[key] = updates[key]
      }

      const { data, error } = await adminClient
        .from('organization_knowledge_base')
        .update(filtered)
        .eq('id', entryId)
        .eq('organization_id', auth.orgId)
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ entry: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // DELETE: Soft-delete entry
    if (req.method === 'DELETE') {
      if (!entryId) {
        return new Response(JSON.stringify({ error: 'id is required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      await adminClient
        .from('organization_knowledge_base')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', entryId)
        .eq('organization_id', auth.orgId)

      return new Response(JSON.stringify({ message: 'Entry deleted' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('org-knowledge-base error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
