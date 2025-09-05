import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// SECURITY FIX: PayPal webhooks should only accept requests from PayPal servers
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://api.paypal.com,https://api.sandbox.paypal.com',
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

    // SECURITY: Verify PayPal webhook signature (already implemented)
    const transmissionId = req.headers.get('paypal-transmission-id');
    const transmissionTime = req.headers.get('paypal-transmission-time');
    const certId = req.headers.get('paypal-cert-id');
    const authAlgo = req.headers.get('paypal-auth-algo');
    const transmissionSig = req.headers.get('paypal-transmission-sig');
    const webhookId = Deno.env.get('PAYPAL_WEBHOOK_ID');

    if (!transmissionId || !transmissionTime || !certId || !authAlgo || !transmissionSig || !webhookId) {
      console.error('Missing required PayPal headers for signature verification');
      
      // Log security event for missing headers
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      await supabase.from('security_logs').insert({
        event_type: 'suspicious_activity',
        event_data: {
          type: 'paypal_webhook_missing_headers',
          event_type: webhookData.event_type || 'unknown',
          headers_present: {
            transmission_id: !!transmissionId,
            transmission_time: !!transmissionTime,
            cert_id: !!certId,
            auth_algo: !!authAlgo,
            transmission_sig: !!transmissionSig
          }
        },
        ip_address: req.headers.get('cf-connecting-ip') || 'unknown'
      });

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
          cert_id: certId,
          verification_status: 'failed'
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
      
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      await supabase.from('security_logs').insert({
        event_type: 'suspicious_activity',
        event_data: {
          type: 'paypal_webhook_invalid_signature',
          event_type: webhookData.event_type,
          verification_result: verificationResult
        },
        ip_address: req.headers.get('cf-connecting-ip') || 'unknown'
      });

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
      const saleId = webhookData.resource.id;
      
      console.log('Processing completed payment:', paymentId);

      // Get payment details to check if it's a donation or job payment
      const paymentDetailsResponse = await fetch(`${paypalBaseUrl}/v1/payments/payment/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!paymentDetailsResponse.ok) {
        console.error('Failed to get payment details');
        return new Response('Payment details retrieval failed', { 
          status: 500, 
          headers: corsHeaders 
        });
      }
      
      const paymentDetails = await paymentDetailsResponse.json();
      const customField = paymentDetails.transactions?.[0]?.custom;
      
      console.log('Payment custom field:', customField);

      // Check if this is a donation (custom field contains donation UUID)
      if (customField && customField.length === 36 && customField.includes('-')) {
        // This looks like a donation UUID
        const { data: donation } = await supabase
          .from('donations')
          .select('id')
          .eq('id', customField)
          .single();

        if (donation) {
          console.log('Processing donation completion for:', customField);
          
          // Update donation status
          const { error: donationError } = await supabase
            .from('donations')
            .update({ 
              status: 'completed',
              payment_id: paymentId
            })
            .eq('id', customField);
          
          if (donationError) {
            console.error('Failed to update donation:', donationError);
            throw donationError;
          }

          // Log successful donation processing
          await supabase.from('security_logs').insert({
            event_type: 'admin_access',
            event_data: {
              action: 'paypal_donation_processed',
              payment_id: paymentId,
              donation_id: customField,
              verification_status: 'success'
            },
            ip_address: req.headers.get('cf-connecting-ip') || 'unknown'
          });
          
          console.log('Donation completed successfully');
          return new Response(
            JSON.stringify({ received: true, type: 'donation' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200 
            }
          );
        }
      }
      
      // If not a donation, try to process as job payment
      let customData;
      try {
        customData = JSON.parse(customField || '{}');
      } catch (e) {
        console.log('Could not parse custom field as JSON, treating as string');
        customData = {};
      }

      // Update payment status - look up by payment_reference instead of payment_id
      const { error: paymentError } = await supabase
        .from('job_payments')
        .update({ 
          status: 'completed'
        })
        .eq('payment_reference', paymentId); // Use payment_reference which stores PayPal payment ID

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
          job_posting_id: customData.job_posting_id,
          verification_status: 'success'
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
    
    // Log error for monitoring
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      await supabase.from('security_logs').insert({
        event_type: 'suspicious_activity',
        event_data: {
          type: 'paypal_webhook_processing_error',
          error: error.message
        },
        ip_address: req.headers.get('cf-connecting-ip') || 'unknown'
      });
    } catch (logError) {
      console.error('Failed to log webhook error:', logError);
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
