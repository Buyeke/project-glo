
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Secure CORS configuration - only allow specific origins
const getAllowedOrigins = () => [
  'https://fznhhkxwzqipwfwihwqr.supabase.co',
  'http://localhost:3000',
  'https://lovable.dev', 
  'https://projectglo.org',
  'https://www.projectglo.org'
];

const getCorsHeaders = (origin?: string) => {
  const allowedOrigins = getAllowedOrigins();
  const requestOrigin = origin || '';
  const isAllowed = allowedOrigins.includes(requestOrigin);
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? requestOrigin : allowedOrigins[3],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
};

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify JWT token is present
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Verify the user is authenticated
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('Invalid or expired token')
    }

    const { amount, currency, description, payment_id, job_posting_id, return_url, cancel_url } = await req.json()

    const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID')
    const paypalClientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET')
    const paypalEnvironment = Deno.env.get('PAYPAL_ENVIRONMENT') || 'sandbox'
    
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

    // Create PayPal payment
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
        description: description
      }],
      redirect_urls: {
        return_url: return_url,
        cancel_url: cancel_url
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
      throw new Error('Failed to create PayPal payment')
    }

    const payment = await paymentResponse.json()
    const approvalUrl = payment.links.find((link: any) => link.rel === 'approval_url')?.href

    if (!approvalUrl) {
      throw new Error('No approval URL found in PayPal response')
    }

    // Update payment record with PayPal payment ID using service role key for security
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error: updateError } = await supabaseService
      .from('job_payments')
      .update({
        paypal_payment_id: payment.id,
        status: 'pending'
      })
      .eq('id', payment_id)

    if (updateError) {
      console.error('Failed to update payment record:', updateError)
      throw new Error('Failed to update payment record')
    }

    return new Response(
      JSON.stringify({
        payment_id: payment.id,
        approval_url: approvalUrl,
        status: 'created'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('PayPal payment processing error:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
