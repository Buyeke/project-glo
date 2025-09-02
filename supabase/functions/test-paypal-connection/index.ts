
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
    const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID')
    const paypalClientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET')
    const paypalEnvironment = Deno.env.get('PAYPAL_ENVIRONMENT') || 'sandbox'
    
    if (!paypalClientId || !paypalClientSecret) {
      throw new Error('PayPal credentials not configured')
    }

    const paypalBaseUrl = paypalEnvironment === 'live' 
      ? 'https://api.paypal.com' 
      : 'https://api.sandbox.paypal.com'

    // Test authentication by getting an access token
    const tokenResponse = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${paypalClientId}:${paypalClientSecret}`)}`
      },
      body: 'grant_type=client_credentials'
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      throw new Error(`PayPal authentication failed: ${errorText}`)
    }

    const tokenData = await tokenResponse.json()
    
    // Verify we got a valid token
    if (!tokenData.access_token) {
      throw new Error('No access token received from PayPal')
    }

    console.log('PayPal connection test successful')

    return new Response(
      JSON.stringify({
        success: true,
        environment: paypalEnvironment,
        message: 'PayPal connection successful'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('PayPal connection test failed:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Return 200 so the frontend can handle the error gracefully
      },
    )
  }
})
