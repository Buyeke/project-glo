import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'
import { getCorsHeaders } from '../_shared/cors.ts'

const corsHeaders = getCorsHeaders()

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: corsHeaders }
      )
    }

    // Verify JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: corsHeaders }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (profile?.user_type !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: corsHeaders }
      )
    }

    // Validate file upload
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: corsHeaders }
      )
    }

    // Validate file type (images only for blog)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type' }),
        { status: 400, headers: corsHeaders }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: 'File too large' }),
        { status: 400, headers: corsHeaders }
      )
    }

    // Generate secure filename
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 15)
    const fileExt = file.name.split('.').pop()
    const secureFilename = `${timestamp}_${randomSuffix}.${fileExt}`

    // Upload to storage
    const { data, error } = await supabase.storage
      .from('blog-images')
      .upload(secureFilename, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return new Response(
        JSON.stringify({ error: 'Upload failed' }),
        { status: 500, headers: corsHeaders }
      )
    }

    // Get public URL
    const { data: publicURL } = supabase.storage
      .from('blog-images')
      .getPublicUrl(data.path)

    // Log upload for audit trail
    await supabase.from('security_logs').insert({
      event_type: 'admin_access',
      user_id: user.id,
      event_data: {
        action: 'file_upload',
        bucket: 'blog-images',
        filename: secureFilename,
        size: file.size,
        type: file.type
      }
    })

    return new Response(
      JSON.stringify({
        url: publicURL.publicUrl,
        path: data.path,
        filename: secureFilename
      }),
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error('Secure upload error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    )
  }
})