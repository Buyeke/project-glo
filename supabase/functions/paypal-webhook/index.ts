
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
    const webhookData = await req.json();
    console.log('PayPal webhook received:', webhookData.event_type);

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
