import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const getEmailSignature = () => `
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
  <div style="text-align: center; padding: 15px 0;">
    <p style="margin: 0 0 5px; font-weight: bold; color: #374151;">Echipa StudyBuddy</p>
    <p style="margin: 0 0 10px; font-size: 12px; color: #6b7280;">─────────────────────────</p>
    <p style="margin: 0 0 8px; font-size: 14px;">🚀 Învățăm mai ușor împreună.</p>
    <p style="margin: 0 0 5px; font-size: 13px; color: #6b7280;">Web: <a href="https://www.studybuddy.ro" style="color: #667eea; text-decoration: none;">www.studybuddy.ro</a></p>
    <p style="margin: 0; font-size: 13px; color: #6b7280;">Email: <a href="mailto:contact@studybuddy.ro" style="color: #667eea; text-decoration: none;">contact@studybuddy.ro</a></p>
  </div>
`;

interface AlertPayload {
  ip_address: string;
  attempt_count: number;
  trigger_user_id: string | null;
  recent_attempts: Array<{
    action: string;
    resource: string;
    created_at: string;
  }>;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!RESEND_API_KEY) {
      console.log("RESEND_API_KEY not configured - security alerts disabled");
      return new Response(
        JSON.stringify({ success: false, error: "Email not configured" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // This function is meant to be called by a database webhook or scheduled job
    // Check for recent security alerts that haven't been emailed yet
    const { data: recentAlerts, error: alertsError } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("action", "SECURITY_ALERT_TRIGGERED")
      .gte("created_at", new Date(Date.now() - 5 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false })
      .limit(10);

    if (alertsError) {
      console.error("Error fetching alerts:", alertsError);
      throw alertsError;
    }

    if (!recentAlerts || recentAlerts.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No alerts to process" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get admin emails
    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (!adminRoles || adminRoles.length === 0) {
      console.log("No admin users found");
      return new Response(
        JSON.stringify({ success: false, error: "No admins to notify" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const adminUserIds = adminRoles.map((r) => r.user_id);
    
    const { data: adminProfiles } = await supabase
      .from("profiles")
      .select("email")
      .in("user_id", adminUserIds);

    if (!adminProfiles || adminProfiles.length === 0) {
      console.log("No admin profiles found");
      return new Response(
        JSON.stringify({ success: false, error: "No admin emails found" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const adminEmails = adminProfiles.map((p) => p.email).filter(Boolean);

    // Build alert summary
    const alertSummary = recentAlerts.map((alert) => {
      const details = alert.details as Record<string, unknown> || {};
      return `
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${new Date(alert.created_at).toLocaleString("ro-RO")}</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${alert.ip_address || "N/A"}</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${details.attempt_count || "N/A"}</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${details.trigger_user_id || "Neautentificat"}</td>
        </tr>
      `;
    }).join("");

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ ALERTĂ SECURITATE</h1>
          <p style="color: #fecaca; margin: 10px 0 0;">Multiple tentative de acces neautorizat detectate</p>
        </div>
        <div style="background: #fef2f2; padding: 20px; border: 1px solid #fecaca; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="margin: 0 0 15px; color: #991b1b;">
            <strong>Atenție!</strong> Au fost detectate multiple tentative de acces neautorizat la resursele protejate ale platformei StudyBuddy.
          </p>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background: white;">
            <thead>
              <tr style="background: #fee2e2;">
                <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: left;">Data/Ora</th>
                <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: left;">IP</th>
                <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: left;">Încercări</th>
                <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: left;">User ID</th>
              </tr>
            </thead>
            <tbody>
              ${alertSummary}
            </tbody>
          </table>
          
          <p style="margin: 0; font-size: 14px; color: #6b7280;">
            Verifică jurnalul de audit din panoul de administrare pentru mai multe detalii.
          </p>
          
          ${getEmailSignature()}
        </div>
      </div>
    `;

    // Send email to all admins
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "StudyBuddy Security <contact@studybuddy.ro>",
        to: adminEmails,
        subject: "⚠️ ALERTĂ SECURITATE - Tentative de acces neautorizat detectate",
        html: htmlContent,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Failed to send security alert email:", errorText);
      throw new Error(`Email send failed: ${errorText}`);
    }

    console.log(`Security alert email sent to ${adminEmails.length} admins`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Alert email sent to ${adminEmails.length} admins`,
        alertCount: recentAlerts.length
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error in security-alert-email function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
