
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
    const { amount, currency, description } = await req.json()
    
    const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID')
    const paypalClientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET')
    const paypalEnvironment = Deno.env.get('PAYPAL_ENVIRONMENT') || 'sandbox'
    
    if (!paypalClientId || !paypalClientSecret) {
      throw new Error('PayPal credentials not configured')
    }

    const paypalBaseUrl = paypalEnvironment === 'live' 
      ? 'https://api.paypal.com' 
      : 'https://api.sandbox.paypal.com'

    // Get PayPal access token
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

    // Create test payment
    const paymentData = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal'
      },
      transactions: [{
        amount: {
          total: (amount / 100).toFixed(2),
          currency: currency
        },
        description: description || 'Test payment'
      }],
      redirect_urls: {
        return_url: 'https://projectglo.org/test-success',
        cancel_url: 'https://projectglo.org/test-cancel'
      }
    }

    const paymentResponse = await fetch(`${paypalBaseUrl}/v1/payments/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenData.access_token}`
      },
      body: JSON.stringify(paymentData)
    })

    if (!paymentResponse.ok) {
      const errorData = await paymentResponse.json()
      console.error('PayPal payment creation failed:', errorData)
      throw new Error('Failed to create test payment')
    }

    const payment = await paymentResponse.json()
    const approvalUrl = payment.links.find((link: any) => link.rel === 'approval_url')?.href

    console.log('PayPal test payment created successfully')

    return new Response(
      JSON.stringify({
        success: true,
        payment_id: payment.id,
        approval_url: approvalUrl,
        environment: paypalEnvironment,
        message: 'Test payment created successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('PayPal test payment failed:', error)
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
