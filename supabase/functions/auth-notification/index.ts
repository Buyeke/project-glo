import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AuthNotificationRequest {
  event_type: "signup" | "login";
  user_email: string;
  user_id: string;
  timestamp: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { event_type, user_email, user_id, timestamp }: AuthNotificationRequest = await req.json();

    if (!event_type || !user_email) {
      throw new Error("Missing required fields");
    }

    const subject = event_type === "signup"
      ? `🆕 New Signup: ${user_email}`
      : `🔑 User Login: ${user_email}`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; border-bottom: 2px solid ${event_type === "signup" ? "#22c55e" : "#3b82f6"}; padding-bottom: 10px;">
          ${event_type === "signup" ? "🆕 New User Signup" : "🔑 User Login"}
        </h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666; font-weight: bold;">Email:</td>
            <td style="padding: 8px 0; color: #333;">${user_email}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-weight: bold;">User ID:</td>
            <td style="padding: 8px 0; color: #333; font-size: 12px;">${user_id}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666; font-weight: bold;">Time:</td>
            <td style="padding: 8px 0; color: #333;">${new Date(timestamp).toLocaleString("en-US", { timeZone: "Africa/Nairobi" })}</td>
          </tr>
        </table>
        <p style="color: #999; font-size: 12px; margin-top: 20px;">— Project GLO Platform</p>
      </div>
    `;

    const { error } = await resend.emails.send({
      from: "GLO Platform <noreply@projectglo.org>",
      to: ["founder@projectglo.org"],
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      throw error;
    }

    console.log(`Auth notification sent: ${event_type} for ${user_email}`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Auth notification error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
