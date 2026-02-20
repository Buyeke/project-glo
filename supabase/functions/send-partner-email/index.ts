
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") || "GLO Platform <onboarding@resend.dev>";

interface EmailRequest {
  type: "application_submitted" | "application_approved" | "application_rejected" | "student_registered" | "student_registered_org" | "invoice_sent";
  to: string;
  data: Record<string, any>;
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("Resend error:", error);
    throw new Error(`Failed to send email: ${res.status}`);
  }

  return await res.json();
}

function getEmailContent(type: string, data: Record<string, any>): { subject: string; html: string } {
  switch (type) {
    case "application_submitted":
      return {
        subject: "GLO Partnership Application Received",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Application Received</h2>
            <p>Dear ${data.contact_name},</p>
            <p>Thank you for submitting your partnership application for <strong>${data.organization_name}</strong>.</p>
            <p>Our team will review your application and get back to you within <strong>48 hours</strong>.</p>
            <p>Best regards,<br/>The GLO Team</p>
          </div>`,
      };

    case "application_approved":
      return {
        subject: "🎉 Your GLO Partnership Application is Approved!",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Application Approved!</h2>
            <p>Dear ${data.contact_name},</p>
            <p>Great news! Your partnership application for <strong>${data.organization_name}</strong> has been approved.</p>
            <h3>Next Steps:</h3>
            <ol>
              <li><strong>Payment:</strong> An invoice for <strong>${data.currency || "USD"} ${data.amount}</strong> (${data.tier} plan) will be sent to you shortly.</li>
              <li><strong>Student Registration:</strong> Once payment is confirmed, share this link with your students:<br/>
                <a href="${data.student_registration_url}" style="color: #2563eb;">${data.student_registration_url}</a></li>
              <li><strong>Set up a semester:</strong> Log in to the Partner Portal to create your first semester and configure settings.</li>
            </ol>
            <p>Best regards,<br/>The GLO Team</p>
          </div>`,
      };

    case "application_rejected":
      return {
        subject: "GLO Partnership Application Update",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Application Update</h2>
            <p>Dear ${data.contact_name},</p>
            <p>Thank you for your interest in partnering with GLO.</p>
            <p>After review, we are unable to approve your application at this time.</p>
            ${data.admin_notes ? `<p><strong>Notes:</strong> ${data.admin_notes}</p>` : ""}
            <p>If you have questions, please contact us at <a href="mailto:founder@projectglo.org">founder@projectglo.org</a>.</p>
            <p>Best regards,<br/>The GLO Team</p>
          </div>`,
      };

    case "student_registered":
      return {
        subject: "Welcome to GLO Education API!",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome, ${data.student_name}!</h2>
            <p>You have been registered with <strong>${data.organization_name}</strong>.</p>
            <p>Your ethics certification is complete. Your API key:</p>
            <div style="background: #f3f4f6; padding: 12px; border-radius: 8px; font-family: monospace; word-break: break-all;">${data.api_key}</div>
            <p><strong>Important:</strong> Save this key securely — it will not be shown again.</p>
            <p>Rate limit: <strong>${data.rate_limit} API calls/day</strong></p>
            <p>Best regards,<br/>The GLO Team</p>
          </div>`,
      };

    case "student_registered_org":
      return {
        subject: `New Student Registered: ${data.student_name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>New Student Registration</h2>
            <p>A new student has registered for <strong>${data.organization_name}</strong>:</p>
            <ul>
              <li><strong>Name:</strong> ${data.student_name}</li>
              <li><strong>Email:</strong> ${data.student_email}</li>
              <li><strong>Student ID:</strong> ${data.student_id_external}</li>
            </ul>
            <p>Total students: <strong>${data.total_students}</strong></p>
            <p>Best regards,<br/>The GLO Team</p>
          </div>`,
      };

    case "invoice_sent":
      return {
        subject: `Invoice ${data.invoice_number} from Project GLO`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1a1a2e; color: white; padding: 24px; border-radius: 8px 8px 0 0;">
              <h2 style="margin: 0;">Invoice ${data.invoice_number}</h2>
              <p style="margin: 4px 0 0; opacity: 0.8;">Project GLO Platform</p>
            </div>
            <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
              <p>Dear ${data.organization_name} team,</p>
              <p>Please find your invoice details below:</p>
              <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 8px 0; color: #6b7280;">Invoice Number</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 600;">${data.invoice_number}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 8px 0; color: #6b7280;">Billing Period</td>
                  <td style="padding: 8px 0; text-align: right;">${data.billing_period}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 8px 0; color: #6b7280;">Amount Due</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 700; font-size: 18px;">${data.currency} ${data.amount}</td>
                </tr>
                ${data.due_date ? `<tr style="border-bottom: 1px solid #e5e7eb;"><td style="padding: 8px 0; color: #6b7280;">Due Date</td><td style="padding: 8px 0; text-align: right;">${data.due_date}</td></tr>` : ''}
                ${data.description ? `<tr style="border-bottom: 1px solid #e5e7eb;"><td style="padding: 8px 0; color: #6b7280;">Description</td><td style="padding: 8px 0; text-align: right;">${data.description}</td></tr>` : ''}
              </table>
              ${data.payment_url ? `
                <div style="text-align: center; margin: 24px 0;">
                  <a href="${data.payment_url}" style="background: #2563eb; color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">Pay Now</a>
                </div>
                <p style="text-align: center; color: #6b7280; font-size: 12px;">Or copy this link: <a href="${data.payment_url}">${data.payment_url}</a></p>
              ` : '<p style="color: #6b7280;">Payment instructions will be communicated separately.</p>'}
              ${data.notes ? `<p style="color: #6b7280; font-size: 14px; margin-top: 16px;"><strong>Notes:</strong> ${data.notes}</p>` : ''}
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
              <p style="color: #6b7280; font-size: 12px;">If you have any questions about this invoice, please contact us at <a href="mailto:founder@projectglo.org">founder@projectglo.org</a>.</p>
            </div>
          </div>`,
      };

    default:
      throw new Error(`Unknown email type: ${type}`);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const body: EmailRequest = await req.json();
    const { type, to, data } = body;

    if (!type || !to || !data) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { subject, html } = getEmailContent(type, data);
    const result = await sendEmail(to, subject, html);

    return new Response(JSON.stringify({ success: true, id: result.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Email error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
