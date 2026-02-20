import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/std@0.208.0/crypto/mod.ts";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Handle callback redirect (user returning from Paystack)
  const url = new URL(req.url);
  if (url.searchParams.get("type") === "callback") {
    const reference = url.searchParams.get("reference") || url.searchParams.get("trxref");
    if (reference) {
      // Verify the transaction with Paystack
      const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
      });
      const verifyData = await verifyRes.json();

      if (verifyData.status && verifyData.data?.status === "success") {
        const invoiceId = verifyData.data.metadata?.invoice_id;
        if (invoiceId) {
          await supabase
            .from("partner_invoices")
            .update({
              status: "paid",
              paid_at: new Date().toISOString(),
              payment_reference: reference,
            })
            .eq("id", invoiceId);
        }
      }
    }
    // Redirect to the platform
    return new Response(null, {
      status: 302,
      headers: { Location: "https://project-glo.lovable.app/admin?tab=partners&payment=success" },
    });
  }

  // Handle Paystack webhook event
  try {
    const body = await req.text();

    // Verify webhook signature
    const signature = req.headers.get("x-paystack-signature");
    if (!signature || !PAYSTACK_SECRET_KEY) {
      return new Response("Unauthorized", { status: 401 });
    }

    const encoder = new TextEncoder();
    const key = encoder.encode(PAYSTACK_SECRET_KEY);
    const data = encoder.encode(body);
    const hmacKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-512" }, false, ["sign"]);
    const sig = await crypto.subtle.sign("HMAC", hmacKey, data);
    const expectedSig = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");

    if (expectedSig !== signature) {
      console.error("Invalid Paystack webhook signature");
      return new Response("Invalid signature", { status: 401 });
    }

    const event = JSON.parse(body);

    if (event.event === "charge.success") {
      const reference = event.data.reference;
      const invoiceId = event.data.metadata?.invoice_id;

      if (invoiceId) {
        await supabase
          .from("partner_invoices")
          .update({
            status: "paid",
            paid_at: new Date().toISOString(),
            payment_reference: reference,
          })
          .eq("id", invoiceId);

        console.log(`Invoice ${invoiceId} marked as paid via webhook`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
