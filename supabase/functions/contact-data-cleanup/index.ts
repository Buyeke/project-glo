
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      throw new Error('Invalid token')
    }

    // Verify admin access
    const { data: adminCheck, error: adminError } = await supabase
      .from('team_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .eq('verified', true)
      .single()

    if (adminError || !adminCheck) {
      throw new Error('Unauthorized: Admin access required')
    }

    // Log security event
    await supabase.from('security_logs').insert({
      event_type: 'data_cleanup',
      user_id: user.id,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
      details: { action: 'contact_data_cleanup' }
    })

    // Clean up old contact submissions (older than 2 years)
    const twoYearsAgo = new Date()
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)

    const { data: cleanupResult, error: cleanupError } = await supabase
      .from('contact_submissions')
      .delete()
      .lt('created_at', twoYearsAgo.toISOString())

    if (cleanupError) throw cleanupError

    const securityHeaders = {
      ...corsHeaders,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'none'",
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Data cleanup completed' }),
      {
        headers: {
          ...securityHeaders,
          'Content-Type': 'application/json',
        },
      }
    )

  } catch (error) {
    console.error('Data cleanup error:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    )
  }
})
