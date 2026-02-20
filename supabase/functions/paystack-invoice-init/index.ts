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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { invoice_id } = await req.json();
    if (!invoice_id) {
      return new Response(JSON.stringify({ error: "invoice_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch invoice with org details
    const { data: invoice, error: invErr } = await supabase
      .from("partner_invoices")
      .select("*, organizations(name, contact_email)")
      .eq("id", invoice_id)
      .single();

    if (invErr || !invoice) {
      return new Response(JSON.stringify({ error: "Invoice not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (invoice.status === "paid") {
      return new Response(JSON.stringify({ error: "Invoice already paid" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const org = invoice.organizations;
    const amountInKobo = Math.round(Number(invoice.amount) * 100);

    // Initialize Paystack transaction
    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: org.contact_email,
        amount: amountInKobo,
        currency: invoice.currency === "KES" ? "KES" : "USD",
        reference: `INV-${invoice.id}`,
        callback_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/paystack-webhook?type=callback`,
        metadata: {
          invoice_id: invoice.id,
          invoice_number: invoice.invoice_number,
          organization_name: org.name,
          custom_fields: [
            { display_name: "Invoice", variable_name: "invoice", value: invoice.invoice_number },
            { display_name: "Organization", variable_name: "org", value: org.name },
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

    // Save payment URL and reference to invoice
    await supabase
      .from("partner_invoices")
      .update({ payment_url: paymentUrl, payment_reference: paymentReference })
      .eq("id", invoice_id);

    return new Response(
      JSON.stringify({ success: true, payment_url: paymentUrl, reference: paymentReference }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Paystack init error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
