
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

    // Calculate date 4 months ago
    const fourMonthsAgo = new Date()
    fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4)

    // Get contact submissions older than 4 months
    const { data: oldSubmissions, error: fetchError } = await supabaseClient
      .from('contact_submissions')
      .select('*')
      .lt('created_at', fourMonthsAgo.toISOString())

    if (fetchError) throw fetchError

    if (oldSubmissions.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No contact submissions older than 4 months found',
          archived_count: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // First, export the old data to CSV
    const csvContent = [
      ['ID', 'Name', 'Email', 'Message', 'Status', 'Created At', 'Updated At', 'Admin Notes'].join(','),
      ...oldSubmissions.map(sub => [
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
    const filename = `contact-submissions-archived-${timestamp}.csv`

    // Store the CSV file in Supabase Storage
    const { error: uploadError } = await supabaseClient
      .storage
      .from('exports')
      .upload(filename, csvContent, {
        contentType: 'text/csv',
        upsert: true
      })

    if (uploadError) throw uploadError

    // Delete the old submissions after successful export
    const { error: deleteError } = await supabaseClient
      .from('contact_submissions')
      .delete()
      .lt('created_at', fourMonthsAgo.toISOString())

    if (deleteError) throw deleteError

    // Log the cleanup operation
    const { error: logError } = await supabaseClient
      .from('export_logs')
      .insert({
        export_type: 'contact_submissions_cleanup',
        file_name: filename,
        record_count: oldSubmissions.length,
        exported_at: new Date().toISOString()
      })

    if (logError) {
      console.error('Error logging cleanup:', logError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully archived and cleaned up ${oldSubmissions.length} contact submissions`,
        filename: filename,
        archived_count: oldSubmissions.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in contact data cleanup:', error)
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
