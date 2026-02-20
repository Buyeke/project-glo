import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");

// Verify Paystack webhook signature
function verifyPaystackSignature(body: string, signature: string | null): boolean {
  if (!signature || !PAYSTACK_SECRET_KEY) return false;
  const encoder = new TextEncoder();
  const key = encoder.encode(PAYSTACK_SECRET_KEY);
  // Use SubtleCrypto for HMAC verification
  return true; // We'll verify inline below
}

Deno.serve(async (req) => {
  // Handle callback redirects (GET requests from Paystack after payment)
  if (req.method === "GET") {
    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    const reference = url.searchParams.get("reference") || url.searchParams.get("trxref");

    if (type === "callback" && reference) {
      // Verify transaction with Paystack
      const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
      });
      const verifyData = await verifyRes.json();

      if (verifyData.status && verifyData.data.status === "success") {
        await processSuccessfulPayment(reference, verifyData.data);
      }

      // Redirect to appropriate page
      const metadata = verifyData.data?.metadata || {};
      const paymentType = metadata.payment_type;
      let redirectUrl = "https://projectglo.org";

      if (paymentType === "job_listing") {
        redirectUrl = "https://projectglo.org/employer-dashboard?payment=success";
      } else if (paymentType === "donation") {
        redirectUrl = "https://projectglo.org/donation-success";
      } else if (metadata.invoice_id) {
        redirectUrl = "https://projectglo.org/partner-portal?payment=success";
      }

      return new Response(null, {
        status: 302,
        headers: { Location: redirectUrl },
      });
    }
  }

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // POST - Paystack webhook event
  try {
    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    // Verify HMAC signature
    if (PAYSTACK_SECRET_KEY && signature) {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(PAYSTACK_SECRET_KEY),
        { name: "HMAC", hash: "SHA-512" },
        false,
        ["sign"]
      );
      const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
      const hash = Array.from(new Uint8Array(sig))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      if (hash !== signature) {
        console.error("Invalid Paystack webhook signature");
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const event = JSON.parse(body);
    console.log("Paystack webhook event:", event.event);

    if (event.event === "charge.success") {
      const reference = event.data.reference;
      await processSuccessfulPayment(reference, event.data);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function processSuccessfulPayment(reference: string, data: any) {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const metadata = data.metadata || {};
  const paymentType = metadata.payment_type;

  console.log("Processing successful payment:", { reference, paymentType });

  if (paymentType === "job_listing") {
    // Update job payment status
    const { error: paymentError } = await supabase
      .from("job_payments")
      .update({ status: "completed", payment_reference: reference })
      .eq("payment_reference", reference);

    if (paymentError) console.error("Failed to update job payment:", paymentError);

    // Activate job posting
    if (metadata.job_posting_id) {
      const { error: jobError } = await supabase
        .from("job_postings")
        .update({ status: "active", payment_status: "completed" })
        .eq("id", metadata.job_posting_id);

      if (jobError) console.error("Failed to activate job posting:", jobError);
      else console.log("Job posting activated:", metadata.job_posting_id);
    }
  } else if (paymentType === "donation") {
    // Update donation status
    if (metadata.donation_id) {
      const { error: donationError } = await supabase
        .from("donations")
        .update({ status: "completed", payment_id: reference })
        .eq("id", metadata.donation_id);

      if (donationError) console.error("Failed to update donation:", donationError);
      else console.log("Donation completed:", metadata.donation_id);
    }
  } else if (metadata.invoice_id || reference.startsWith("INV-")) {
    // Handle partner invoice payment (existing logic from paystack-invoice-webhook)
    const invoiceId = metadata.invoice_id || reference.replace("INV-", "");
    const { error: invError } = await supabase
      .from("partner_invoices")
      .update({
        status: "paid",
        payment_reference: reference,
        paid_at: new Date().toISOString(),
      })
      .eq("id", invoiceId);

    if (invError) console.error("Failed to update invoice:", invError);
    else console.log("Invoice paid:", invoiceId);
  }

  // Log successful payment
  await supabase.from("security_logs").insert({
    event_type: "admin_access",
    event_data: {
      action: "paystack_payment_processed",
      payment_type: paymentType || "unknown",
      reference,
    },
    ip_address: "webhook",
  });
}
