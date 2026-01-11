
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://fznhhkxwzqipwfwihwqr.supabase.co',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Input sanitization function to prevent injection attacks
const sanitizeQuery = (query: string): string => {
  if (typeof query !== 'string') {
    return '';
  }
  // Remove characters that could manipulate PostgREST filter logic
  return query
    .replace(/[%,(){}[\].\\]/g, '')
    .substring(0, 100)
    .trim();
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required', request_id: requestId }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token', request_id: requestId }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const rawQuery = body.query;
    const limit = Math.min(Math.max(1, parseInt(body.limit) || 5), 20); // Clamp between 1-20
    
    // Sanitize input to prevent injection attacks
    const sanitizedQuery = sanitizeQuery(rawQuery);
    
    if (!sanitizedQuery || sanitizedQuery.length < 2) {
      return new Response(
        JSON.stringify({ error: 'Query must be at least 2 characters', results: [], request_id: requestId }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!openaiApiKey || !supabaseUrl || !supabaseServiceKey) {
      console.error('Missing required environment variables');
      return new Response(
        JSON.stringify({ error: 'Service configuration error', results: [], request_id: requestId }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate embedding for the query
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: sanitizedQuery,
      }),
    });

    if (!embeddingResponse.ok) {
      console.error('Failed to generate embedding:', await embeddingResponse.text());
      return new Response(
        JSON.stringify({ error: 'Search processing error', results: [], request_id: requestId }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    // Search knowledge base using vector similarity
    const { data: knowledgeItems, error } = await supabase.rpc('search_knowledge_items', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: limit
    });

    if (error) {
      console.error('Knowledge search error:', error);
      // Fallback to text search with sanitized input - using separate filter calls
      const { data: fallbackResults } = await supabase
        .from('knowledge_base')
        .select('*')
        .or(`title.ilike.%${sanitizedQuery}%,content.ilike.%${sanitizedQuery}%`)
        .limit(limit);
      
      return new Response(
        JSON.stringify({ results: fallbackResults || [], request_id: requestId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log usage for security monitoring (anonymized query length only)
    await supabaseAuth.from('security_logs').insert({
      event_type: 'admin_access',
      user_id: user.id,
      event_data: {
        action: 'knowledge_search_used',
        query_length: sanitizedQuery.length,
        results_count: knowledgeItems?.length || 0
      },
      ip_address: req.headers.get('cf-connecting-ip') || 'unknown'
    });

    return new Response(
      JSON.stringify({ results: knowledgeItems || [], request_id: requestId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Search knowledge error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred while processing your request', results: [], request_id: requestId }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
