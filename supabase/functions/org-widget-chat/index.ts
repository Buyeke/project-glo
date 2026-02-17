import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    const apiKey = req.headers.get('x-api-key')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key required' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Validate API key
    const encoder = new TextEncoder()
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(apiKey))
    const keyHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')

    const { data: orgId } = await adminClient.rpc('validate_api_key', { p_key_hash: keyHash })
    if (!orgId) {
      return new Response(JSON.stringify({ error: 'Invalid API key' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check widget:embed scope
    const { data: keyData } = await adminClient
      .from('organization_api_keys')
      .select('scopes, rate_limit_per_minute')
      .eq('key_hash', keyHash)
      .single()

    if (!keyData?.scopes?.includes('widget:embed')) {
      return new Response(JSON.stringify({ error: 'API key lacks widget:embed scope' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { message, session_token, visitor_id, language } = await req.json()

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'message is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Sanitize message
    const sanitizedMessage = message.trim().substring(0, 2000)

    // Get org's knowledge base
    const { data: kbEntries } = await adminClient
      .from('organization_knowledge_base')
      .select('title, content, category')
      .eq('organization_id', orgId)
      .eq('is_active', true)
      .eq('language', language || 'en')
      .limit(20)

    // Get org info for branding
    const { data: org } = await adminClient
      .from('organizations')
      .select('name, settings')
      .eq('id', orgId)
      .single()

    // Build context from knowledge base
    const kbContext = (kbEntries || [])
      .map(e => `[${e.category}] ${e.title}: ${e.content}`)
      .join('\n\n')

    // Generate response using Lovable AI gateway
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')
    let responseText = ''

    if (lovableApiKey && kbContext) {
      const systemPrompt = `You are a helpful assistant for ${org?.name || 'this organization'}. 
Answer questions using ONLY the following knowledge base. If you cannot answer from the knowledge base, say so politely and suggest contacting the organization directly.
Be trauma-informed, culturally sensitive, and supportive. Respond in the language the user writes in (English, Swahili, or Sheng).

Knowledge Base:
${kbContext}`

      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: sanitizedMessage },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      })

      if (aiResponse.ok) {
        const aiData = await aiResponse.json()
        responseText = aiData.choices?.[0]?.message?.content || ''
      }
    }

    if (!responseText) {
      // Fallback: simple keyword matching against knowledge base
      const lowerMessage = sanitizedMessage.toLowerCase()
      const matched = (kbEntries || []).find(e =>
        e.title.toLowerCase().includes(lowerMessage) ||
        e.content.toLowerCase().includes(lowerMessage)
      )
      responseText = matched
        ? matched.content
        : `Thank you for reaching out. Please contact ${org?.name || 'the organization'} directly for assistance.`
    }

    // Store/update chat session
    const sessionToken = session_token || crypto.randomUUID()
    
    if (session_token) {
      // Update existing session
      const { data: existing } = await adminClient
        .from('widget_chat_sessions')
        .select('messages')
        .eq('session_token', session_token)
        .eq('organization_id', orgId)
        .single()

      if (existing) {
        const messages = [...(existing.messages as any[]), 
          { role: 'user', content: sanitizedMessage, timestamp: new Date().toISOString() },
          { role: 'assistant', content: responseText, timestamp: new Date().toISOString() },
        ]
        await adminClient
          .from('widget_chat_sessions')
          .update({ messages, updated_at: new Date().toISOString() })
          .eq('session_token', session_token)
      }
    } else {
      // Create new session
      await adminClient.from('widget_chat_sessions').insert({
        organization_id: orgId,
        session_token: sessionToken,
        visitor_id: visitor_id || null,
        messages: [
          { role: 'user', content: sanitizedMessage, timestamp: new Date().toISOString() },
          { role: 'assistant', content: responseText, timestamp: new Date().toISOString() },
        ],
      })
    }

    return new Response(JSON.stringify({
      response: responseText,
      session_token: sessionToken,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('org-widget-chat error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
