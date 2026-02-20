import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  // Rate limiting check
  const clientIp = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const rateLimitKey = `donation_${clientIp}`;

  try {
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check rate limit - max 3 donation attempts per hour per IP
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const { data: recentAttempts } = await supabaseService
      .from("rate_limits")
      .select("attempt_count")
      .eq("identifier", rateLimitKey)
      .eq("action_type", "donation")
      .gte("window_start", oneHourAgo.toISOString())
      .single();

    if (recentAttempts && recentAttempts.attempt_count >= 3) {
      return new Response(JSON.stringify({ error: "Too many donation attempts. Please try again later." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabaseService.from("rate_limits").upsert({
      identifier: rateLimitKey,
      action_type: "donation",
      attempt_count: (recentAttempts?.attempt_count || 0) + 1,
      window_start: new Date().toISOString(),
    });
  } catch (rateLimitError) {
    console.error("Rate limiting check failed:", rateLimitError);
  }

  // Validate content type
  const contentType = req.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return new Response(JSON.stringify({ error: "Invalid content type" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    if (!PAYSTACK_SECRET_KEY) {
      throw new Error("PAYSTACK_SECRET_KEY not configured");
    }

    const {
      amount,
      currency = "USD",
      description,
      return_url,
      cancel_url,
      donor_email,
      donor_name,
      message,
      anonymous = false,
    } = await req.json();

    console.log("Processing donation payment:", {
      amount,
      currency,
      donor_email_domain: donor_email ? donor_email.split("@")[1] : "unknown",
      has_message: !!message,
      anonymous,
    });

    // Input validation
    if (!amount || amount <= 0 || amount > 10000) {
      return new Response(JSON.stringify({ error: "Invalid amount (must be between $1 and $10,000)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!donor_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donor_email) || donor_email.length > 254) {
      return new Response(JSON.stringify({ error: "Valid donor email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sanitizedMessage = message ? message.replace(/<[^>]*>/g, "").substring(0, 500) : "";
    const sanitizedDonorName = donor_name ? donor_name.replace(/<[^>]*>/g, "").substring(0, 100) : "";

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Create donation record
    const { data: donation, error: donationError } = await supabaseService
      .from("donations")
      .insert({
        donor_name: anonymous ? null : sanitizedDonorName,
        donor_email,
        amount,
        currency,
        message: sanitizedMessage,
        anonymous,
        payment_method: "paystack",
        status: "pending",
      })
      .select()
      .single();

    if (donationError) {
      console.error("Failed to create donation record:", donationError);
      return new Response(JSON.stringify({ error: "Failed to create donation record" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize Paystack transaction
    // Paystack supports USD and KES
    const amountInSmallestUnit = Math.round(amount * 100);
    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: donor_email,
        amount: amountInSmallestUnit,
        currency: currency === "KES" ? "KES" : "USD",
        reference: `DON-${donation.id}`,
        callback_url: return_url || "https://projectglo.org/donation-success",
        metadata: {
          payment_type: "donation",
          donation_id: donation.id,
          donor_name: anonymous ? "Anonymous" : sanitizedDonorName,
          custom_fields: [
            { display_name: "Donation", variable_name: "donation", value: description || `Donation - $${amount}` },
          ],
        },
      }),
    });

    const paystackData = await paystackRes.json();

    if (!paystackRes.ok || !paystackData.status) {
      console.error("Paystack error:", paystackData);
      await supabaseService.from("donations").update({ status: "failed" }).eq("id", donation.id);
      throw new Error(`Paystack init failed: ${paystackData.message || "Unknown error"}`);
    }

    const paymentUrl = paystackData.data.authorization_url;
    const paymentReference = paystackData.data.reference;

    // Update donation with payment reference
    await supabaseService
      .from("donations")
      .update({ payment_id: paymentReference })
      .eq("id", donation.id);

    console.log("Donation payment initialized successfully");

    return new Response(
      JSON.stringify({
        donation_id: donation.id,
        approval_url: paymentUrl,
        reference: paymentReference,
        status: "created",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Donation payment processing error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
