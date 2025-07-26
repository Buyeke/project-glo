
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      amount, 
      currency, 
      description, 
      payment_id, 
      job_posting_id, 
      return_url, 
      cancel_url 
    } = await req.json();

    console.log('Processing PayPal payment request:', { amount, currency, description });

    // Get PayPal credentials from environment
    const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
    const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
    const environment = Deno.env.get('PAYPAL_ENVIRONMENT') || 'sandbox';

    if (!clientId || !clientSecret) {
      throw new Error('PayPal credentials not configured');
    }

    const baseURL = environment === 'sandbox' 
      ? 'https://api.sandbox.paypal.com'
      : 'https://api.paypal.com';

    // Get access token
    const tokenResponse = await fetch(`${baseURL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get PayPal access token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Convert KES to USD for PayPal (approximate rate: 1 USD = 130 KES)
    const amountInUSD = (amount / 130).toFixed(2);

    // Create payment
    const paymentData = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal'
      },
      transactions: [{
        amount: {
          total: amountInUSD,
          currency: 'USD'
        },
        description: description,
        custom: JSON.stringify({ payment_id, job_posting_id })
      }],
      redirect_urls: {
        return_url: return_url,
        cancel_url: cancel_url
      }
    };

    const paymentResponse = await fetch(`${baseURL}/v1/payments/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(paymentData),
    });

    if (!paymentResponse.ok) {
      const errorData = await paymentResponse.json();
      console.error('PayPal payment creation failed:', errorData);
      throw new Error('Failed to create PayPal payment');
    }

    const payment = await paymentResponse.json();
    console.log('PayPal payment created:', payment.id);

    // Find approval URL
    const approvalUrl = payment.links.find((link: any) => link.rel === 'approval_url')?.href;

    if (!approvalUrl) {
      throw new Error('No approval URL returned from PayPal');
    }

    // Initialize Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Update payment record with PayPal payment ID
    const { error: updateError } = await supabase
      .from('job_payments')
      .update({ 
        payment_reference: payment.id,
        status: 'pending'
      })
      .eq('id', payment_id);

    if (updateError) {
      console.error('Failed to update payment record:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        approval_url: approvalUrl,
        payment_id: payment.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('PayPal payment processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
