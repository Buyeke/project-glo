
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all contact submissions
    const { data: submissions, error } = await supabaseClient
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Create CSV content
    const csvContent = [
      ['ID', 'Name', 'Email', 'Message', 'Status', 'Created At', 'Updated At', 'Admin Notes'].join(','),
      ...submissions.map(sub => [
        sub.id,
        `"${sub.name}"`,
        `"${sub.email}"`,
        `"${sub.message.replace(/"/g, '""')}"`,
        sub.status,
        new Date(sub.created_at).toISOString(),
        new Date(sub.updated_at).toISOString(),
        `"${sub.admin_notes || ''}"`
      ].join(','))
    ].join('\n')

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `contact-submissions-export-${timestamp}.csv`

    // Store the CSV file in Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseClient
      .storage
      .from('exports')
      .upload(filename, csvContent, {
        contentType: 'text/csv',
        upsert: true
      })

    if (uploadError) throw uploadError

    // Create a record of the export
    const { error: logError } = await supabaseClient
      .from('export_logs')
      .insert({
        export_type: 'contact_submissions',
        file_name: filename,
        record_count: submissions.length,
        exported_at: new Date().toISOString()
      })

    if (logError) {
      console.error('Error logging export:', logError)
    }

    // Get public URL for the exported file
    const { data: urlData } = supabaseClient
      .storage
      .from('exports')
      .getPublicUrl(filename)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully exported ${submissions.length} contact submissions`,
        filename: filename,
        download_url: urlData.publicUrl,
        record_count: submissions.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in contact data export:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
