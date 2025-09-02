
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const webhookId = Deno.env.get('PAYPAL_WEBHOOK_ID')
    const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID')
    const paypalClientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET')
    const paypalEnvironment = Deno.env.get('PAYPAL_ENVIRONMENT') || 'sandbox'
    
    if (!webhookId) {
      throw new Error('PayPal webhook ID not configured')
    }

    if (!paypalClientId || !paypalClientSecret) {
      throw new Error('PayPal credentials not configured')
    }

    const paypalBaseUrl = paypalEnvironment === 'live' 
      ? 'https://api.paypal.com' 
      : 'https://api.sandbox.paypal.com'

    // Get access token
    const tokenResponse = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${paypalClientId}:${paypalClientSecret}`)}`
      },
      body: 'grant_type=client_credentials'
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to get PayPal access token')
    }

    const tokenData = await tokenResponse.json()

    // Check webhook configuration
    const webhookResponse = await fetch(`${paypalBaseUrl}/v1/notifications/webhooks/${webhookId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    })

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text()
      throw new Error(`Webhook verification failed: ${errorText}`)
    }

    const webhookData = await webhookResponse.json()
    
    // Check if webhook URL is correct
    const expectedUrl = 'https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1/paypal-webhook'
    const webhookUrl = webhookData.url
    
    if (webhookUrl !== expectedUrl) {
      throw new Error(`Webhook URL mismatch. Expected: ${expectedUrl}, Got: ${webhookUrl}`)
    }

    // Check if PAYMENT.SALE.COMPLETED event is enabled
    const hasPaymentEvent = webhookData.event_types?.some(
      (event: any) => event.name === 'PAYMENT.SALE.COMPLETED'
    )

    if (!hasPaymentEvent) {
      throw new Error('PAYMENT.SALE.COMPLETED event is not enabled on webhook')
    }

    console.log('PayPal webhook test successful')

    return new Response(
      JSON.stringify({
        success: true,
        webhook_id: webhookId,
        webhook_url: webhookUrl,
        events_configured: webhookData.event_types?.length || 0,
        message: 'Webhook configuration verified'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('PayPal webhook test failed:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  }
})
