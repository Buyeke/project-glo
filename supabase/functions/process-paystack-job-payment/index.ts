import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!PAYSTACK_SECRET_KEY) {
      throw new Error("PAYSTACK_SECRET_KEY not configured");
    }

    // Verify JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { job_data, employer_profile_id, amount_kes, return_url, cancel_url } = await req.json();

    if (!job_data || !employer_profile_id || !amount_kes) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Create job posting with pending_payment status
    const { data: jobPosting, error: jobError } = await supabaseService
      .from("job_postings")
      .insert({
        ...job_data,
        status: "pending_payment",
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (jobError) throw jobError;

    // Create payment record
    const { data: payment, error: paymentError } = await supabaseService
      .from("job_payments")
      .insert({
        job_posting_id: jobPosting.id,
        employer_id: employer_profile_id,
        amount: amount_kes,
        payment_method: "paystack",
        status: "pending",
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    // Initialize Paystack transaction
    const amountInKobo = Math.round(amount_kes * 100);
    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount: amountInKobo,
        currency: "KES",
        reference: `JOB-${payment.id}`,
        callback_url: return_url || `${Deno.env.get("SUPABASE_URL")}/functions/v1/paystack-invoice-webhook?type=callback`,
        metadata: {
          payment_type: "job_listing",
          payment_id: payment.id,
          job_posting_id: jobPosting.id,
          custom_fields: [
            { display_name: "Payment For", variable_name: "payment_for", value: `Job Listing: ${job_data.title}` },
          ],
        },
      }),
    });

    const paystackData = await paystackRes.json();

    if (!paystackRes.ok || !paystackData.status) {
      console.error("Paystack error:", paystackData);
      throw new Error(`Paystack init failed: ${paystackData.message || "Unknown error"}`);
    }

    const paymentUrl = paystackData.data.authorization_url;
    const paymentReference = paystackData.data.reference;

    // Update payment record with reference
    await supabaseService
      .from("job_payments")
      .update({ payment_reference: paymentReference })
      .eq("id", payment.id);

    return new Response(
      JSON.stringify({
        success: true,
        payment_url: paymentUrl,
        reference: paymentReference,
        job_posting_id: jobPosting.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Paystack job payment error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
