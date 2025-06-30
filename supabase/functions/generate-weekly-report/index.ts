
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Calculate date range for the past week
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000)

    console.log(`Generating weekly report from ${startDate.toISOString()} to ${endDate.toISOString()}`)

    // Fetch service requests data
    const { data: serviceRequests } = await supabaseClient
      .from('service_requests_tracking')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    // Fetch feedback data
    const { data: feedback } = await supabaseClient
      .from('user_feedback')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    // Fetch usage stats
    const { data: usageStats } = await supabaseClient
      .from('usage_stats')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    // Calculate metrics
    const totalRequests = serviceRequests?.length || 0
    const completedRequests = serviceRequests?.filter(r => r.status === 'completed').length || 0
    const completionRate = totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0
    
    const avgRating = feedback?.length > 0 
      ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length 
      : 0

    const avgResponseTime = serviceRequests
      ?.filter(r => r.response_time_hours)
      .reduce((sum, r) => sum + r.response_time_hours, 0) / serviceRequests?.filter(r => r.response_time_hours).length || 0

    // Language distribution
    const languageStats = serviceRequests?.reduce((acc, req) => {
      acc[req.language_used] = (acc[req.language_used] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Service type distribution
    const serviceTypeStats = serviceRequests?.reduce((acc, req) => {
      acc[req.service_type] = (acc[req.service_type] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Unique users
    const uniqueUsers = new Set(usageStats?.map(stat => stat.user_id)).size

    // Compile report
    const reportMetrics = {
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      },
      service_requests: {
        total: totalRequests,
        completed: completedRequests,
        completion_rate: parseFloat(completionRate.toFixed(2)),
        avg_response_time_hours: parseFloat(avgResponseTime.toFixed(2))
      },
      feedback: {
        total_responses: feedback?.length || 0,
        average_rating: parseFloat(avgRating.toFixed(2))
      },
      usage: {
        total_interactions: usageStats?.length || 0,
        unique_users: uniqueUsers
      },
      language_distribution: languageStats,
      service_type_distribution: serviceTypeStats
    }

    // Store the report
    const { data: reportData, error: reportError } = await supabaseClient
      .from('admin_reports')
      .insert({
        report_type: 'weekly',
        report_date: endDate.toISOString().split('T')[0],
        metrics: reportMetrics
      })

    if (reportError) {
      console.error('Error storing report:', reportError)
      throw reportError
    }

    console.log('Weekly report generated successfully:', reportMetrics)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Weekly report generated successfully',
        metrics: reportMetrics
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error generating weekly report:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate weekly report',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
