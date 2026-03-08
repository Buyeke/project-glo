import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
  corsHeaders, errorResponse, cachedJsonResponse, ErrorCode,
} from '../_shared/edu-auth.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'GET') {
    return errorResponse(ErrorCode.METHOD_NOT_ALLOWED, 'Method not allowed', 405)
  }

  try {
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const url = new URL(req.url)
    const docType = url.searchParams.get('type') || 'schema'
    const language = url.searchParams.get('lang') || 'en'

    const validTypes = ['schema', 'examples', 'glossary']
    if (!validTypes.includes(docType)) {
      return errorResponse(ErrorCode.VALIDATION_ERROR, `Invalid doc type. Valid types: ${validTypes.join(', ')}`, 400)
    }

    const { data: doc, error } = await adminClient
      .from('edu_docs')
      .select('*')
      .eq('doc_type', docType)
      .eq('language', language)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !doc) {
      return errorResponse(ErrorCode.NOT_FOUND, 'Documentation not found', 404)
    }

    // Docs are highly cacheable — 5 minutes
    return cachedJsonResponse(doc, 300)
  } catch (error) {
    console.error('education-docs error:', error)
    return errorResponse(ErrorCode.INTERNAL_ERROR, 'Internal server error', 500)
  }
})
