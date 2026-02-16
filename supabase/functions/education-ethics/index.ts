import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

async function authenticateStudent(req: Request) {
  const adminClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const apiKey = req.headers.get('x-api-key')
  if (apiKey) {
    const encoder = new TextEncoder()
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(apiKey))
    const keyHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')

    // Find student by API key hash
    const { data: student } = await adminClient
      .from('edu_students')
      .select('*, edu_semesters!inner(organization_id, settings)')
      .eq('api_key_hash', keyHash)
      .eq('status', 'active')
      .single()

    if (student) {
      return { student, adminClient }
    }
  }

  // JWT auth fallback
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

  const { data: student } = await adminClient
    .from('edu_students')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (!student) return null
  return { student, adminClient }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const auth = await authenticateStudent(req)
    if (!auth) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { student, adminClient } = auth

    // GET: check ethics status
    if (req.method === 'GET') {
      return new Response(JSON.stringify({
        student_id: student.id,
        ethics_certified: student.ethics_certified,
        ethics_certified_at: student.ethics_certified_at,
        ethics_cert_id: student.ethics_cert_id,
        ethics_quiz_score: student.ethics_quiz_score,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // POST: submit ethics certification
    if (req.method === 'POST') {
      const { quiz_score, cert_id } = await req.json()

      if (quiz_score === undefined || !cert_id) {
        return new Response(JSON.stringify({ error: 'Required: quiz_score, cert_id' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Get org settings for minimum passing score
      const { data: org } = await adminClient
        .from('organizations')
        .select('settings')
        .eq('id', student.organization_id)
        .single()

      const minScore = (org?.settings as Record<string, unknown>)?.ethics_min_score ?? 80

      if (quiz_score < (minScore as number)) {
        return new Response(JSON.stringify({
          error: 'Quiz score below minimum threshold',
          minimum_required: minScore,
          your_score: quiz_score,
        }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const { error } = await adminClient
        .from('edu_students')
        .update({
          ethics_certified: true,
          ethics_certified_at: new Date().toISOString(),
          ethics_cert_id: cert_id,
          ethics_quiz_score: quiz_score,
          updated_at: new Date().toISOString(),
        })
        .eq('id', student.id)

      if (error) throw error

      return new Response(JSON.stringify({
        success: true,
        ethics_certified: true,
        message: 'Ethics certification recorded. API access is now enabled.',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('education-ethics error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
