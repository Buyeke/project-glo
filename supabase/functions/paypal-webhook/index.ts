
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://api.paypal.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, paypal-transmission-id, paypal-transmission-time, paypal-cert-id, paypal-auth-algo, paypal-transmission-sig',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookData = await req.json();
    const rawBody = JSON.stringify(webhookData);
    
    console.log('PayPal webhook received:', webhookData.event_type);

    // Verify PayPal webhook signature
    const transmissionId = req.headers.get('paypal-transmission-id');
    const transmissionTime = req.headers.get('paypal-transmission-time');
    const certId = req.headers.get('paypal-cert-id');
    const authAlgo = req.headers.get('paypal-auth-algo');
    const transmissionSig = req.headers.get('paypal-transmission-sig');
    const webhookId = Deno.env.get('PAYPAL_WEBHOOK_ID');

    if (!transmissionId || !transmissionTime || !certId || !authAlgo || !transmissionSig || !webhookId) {
      console.error('Missing required PayPal headers for signature verification');
      return new Response(
        JSON.stringify({ error: 'Missing required PayPal headers' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Get PayPal access token for verification
    const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID');
    const paypalClientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
    const paypalEnvironment = Deno.env.get('PAYPAL_ENVIRONMENT') || 'sandbox';
    
    const paypalBaseUrl = paypalEnvironment === 'live' 
      ? 'https://api.paypal.com' 
      : 'https://api.sandbox.paypal.com';

    if (!paypalClientId || !paypalClientSecret) {
      throw new Error('PayPal credentials not configured');
    }

    // Get access token
    const tokenResponse = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
        'Authorization': `Basic ${btoa(`${paypalClientId}:${paypalClientSecret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get PayPal access token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Verify webhook signature
    const verificationResponse = await fetch(`${paypalBaseUrl}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        transmission_id: transmissionId,
        cert_id: certId,
        auth_algo: authAlgo,
        transmission_time: transmissionTime,
        transmission_sig: transmissionSig,
        webhook_id: webhookId,
        webhook_event: webhookData
      })
    });

    if (!verificationResponse.ok) {
      console.error('Failed to verify PayPal webhook signature');
      
      // Log security event for failed verification
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      await supabase.from('security_logs').insert({
        event_type: 'suspicious_activity',
        event_data: {
          type: 'paypal_webhook_verification_failed',
          event_type: webhookData.event_type,
          transmission_id: transmissionId,
          cert_id: certId
        },
        ip_address: req.headers.get('cf-connecting-ip') || 'unknown'
      });

      return new Response(
        JSON.stringify({ error: 'Webhook signature verification failed' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }

    const verificationResult = await verificationResponse.json();
    if (verificationResult.verification_status !== 'SUCCESS') {
      console.error('PayPal webhook signature verification failed:', verificationResult);
      return new Response(
        JSON.stringify({ error: 'Invalid webhook signature' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }

    console.log('PayPal webhook signature verified successfully');

    // Initialize Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (webhookData.event_type === 'PAYMENT.SALE.COMPLETED') {
      const paymentId = webhookData.resource.parent_payment;
      const customData = JSON.parse(webhookData.resource.custom || '{}');
      
      console.log('Processing completed payment:', paymentId);

      // Update payment status
      const { error: paymentError } = await supabase
        .from('job_payments')
        .update({ 
          status: 'completed',
          payment_reference: paymentId
        })
        .eq('id', customData.payment_id);

      if (paymentError) {
        console.error('Failed to update payment:', paymentError);
        throw paymentError;
      }

      // Activate job posting
      const { error: jobError } = await supabase
        .from('job_postings')
        .update({ 
          status: 'active',
          payment_status: 'completed'
        })
        .eq('id', customData.job_posting_id);

      if (jobError) {
        console.error('Failed to activate job posting:', jobError);
        throw jobError;
      }

      // Log successful payment processing
      await supabase.from('security_logs').insert({
        event_type: 'admin_access',
        event_data: {
          action: 'paypal_payment_processed',
          payment_id: paymentId,
          job_posting_id: customData.job_posting_id
        },
        ip_address: req.headers.get('cf-connecting-ip') || 'unknown'
      });

      console.log('Job posting activated successfully');
    }

    return new Response(
      JSON.stringify({ received: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('PayPal webhook processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
