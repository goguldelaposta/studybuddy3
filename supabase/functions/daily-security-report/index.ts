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

interface SecurityStats {
  totalAttempts: number;
  uniqueIPs: number;
  blockedIPs: number;
  topTargetedResources: Array<{ resource: string; count: number }>;
  topOffendingIPs: Array<{ ip: string; count: number }>;
  alertsTriggered: number;
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
      console.log("RESEND_API_KEY not configured - daily reports disabled");
      return new Response(
        JSON.stringify({ success: false, error: "Email not configured" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Calculate time range for the last 24 hours
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayISO = yesterday.toISOString();

    // Fetch security stats for the last 24 hours
    const { data: auditLogs, error: logsError } = await supabase
      .from("audit_logs")
      .select("*")
      .gte("created_at", yesterdayISO)
      .in("action", ["UNAUTHORIZED_ACCESS_ATTEMPT", "failed_auth", "IP_BLOCKED", "SECURITY_ALERT_TRIGGERED"]);

    if (logsError) {
      console.error("Error fetching audit logs:", logsError);
      throw logsError;
    }

    // Fetch blocked IPs in last 24 hours
    const { data: blockedIPs, error: blockedError } = await supabase
      .from("blocked_ips")
      .select("*")
      .gte("blocked_at", yesterdayISO);

    if (blockedError) {
      console.error("Error fetching blocked IPs:", blockedError);
    }

    // Calculate statistics
    const attemptLogs = auditLogs?.filter(l => 
      l.action === "UNAUTHORIZED_ACCESS_ATTEMPT" || l.action === "failed_auth"
    ) || [];
    
    const uniqueIPsSet = new Set(attemptLogs.map(l => l.ip_address).filter(Boolean));
    
    // Count resources targeted
    const resourceCounts: Record<string, number> = {};
    attemptLogs.forEach(log => {
      const resource = log.resource || "unknown";
      resourceCounts[resource] = (resourceCounts[resource] || 0) + 1;
    });
    
    // Count IPs
    const ipCounts: Record<string, number> = {};
    attemptLogs.forEach(log => {
      const ip = log.ip_address || "unknown";
      ipCounts[ip] = (ipCounts[ip] || 0) + 1;
    });

    const stats: SecurityStats = {
      totalAttempts: attemptLogs.length,
      uniqueIPs: uniqueIPsSet.size,
      blockedIPs: blockedIPs?.length || 0,
      topTargetedResources: Object.entries(resourceCounts)
        .map(([resource, count]) => ({ resource, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      topOffendingIPs: Object.entries(ipCounts)
        .map(([ip, count]) => ({ ip, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      alertsTriggered: auditLogs?.filter(l => l.action === "SECURITY_ALERT_TRIGGERED").length || 0,
    };

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

    // Determine severity color based on stats
    const severityColor = stats.totalAttempts > 50 ? "#dc2626" : 
                          stats.totalAttempts > 20 ? "#f59e0b" : "#10b981";
    const severityLabel = stats.totalAttempts > 50 ? "RIDICAT" : 
                          stats.totalAttempts > 20 ? "MODERAT" : "NORMAL";

    // Build resource table rows
    const resourceRows = stats.topTargetedResources.length > 0 
      ? stats.topTargetedResources.map(r => `
          <tr>
            <td style="padding: 8px; border: 1px solid #e5e7eb;">${r.resource}</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">${r.count}</td>
          </tr>
        `).join("")
      : `<tr><td colspan="2" style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">Nicio tentativă înregistrată</td></tr>`;

    // Build IP table rows
    const ipRows = stats.topOffendingIPs.length > 0
      ? stats.topOffendingIPs.map(ip => `
          <tr>
            <td style="padding: 8px; border: 1px solid #e5e7eb; font-family: monospace;">${ip.ip}</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">${ip.count}</td>
          </tr>
        `).join("")
      : `<tr><td colspan="2" style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">Nicio adresă IP suspectă</td></tr>`;

    // Build blocked IPs section
    const blockedSection = blockedIPs && blockedIPs.length > 0 
      ? `
        <h3 style="color: #dc2626; margin: 20px 0 10px;">🚫 IP-uri Blocate Recent (${blockedIPs.length})</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background: white;">
          <thead>
            <tr style="background: #fee2e2;">
              <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: left;">IP</th>
              <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: left;">Motiv</th>
              <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: left;">Expiră</th>
            </tr>
          </thead>
          <tbody>
            ${blockedIPs.map(b => `
              <tr>
                <td style="padding: 8px; border: 1px solid #e5e7eb; font-family: monospace;">${b.ip_address}</td>
                <td style="padding: 8px; border: 1px solid #e5e7eb;">${b.reason}</td>
                <td style="padding: 8px; border: 1px solid #e5e7eb;">${new Date(b.blocked_until).toLocaleString("ro-RO")}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `
      : "";

    const reportDate = now.toLocaleDateString("ro-RO", { 
      weekday: "long", 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%); padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">📊 Raport Zilnic de Securitate</h1>
          <p style="color: #c7d2fe; margin: 10px 0 0; font-size: 14px;">${reportDate}</p>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
          
          <!-- Summary Cards -->
          <div style="display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 120px; background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0; font-size: 28px; font-weight: bold; color: ${severityColor};">${stats.totalAttempts}</p>
              <p style="margin: 5px 0 0; font-size: 12px; color: #6b7280;">Tentative</p>
            </div>
            <div style="flex: 1; min-width: 120px; background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0; font-size: 28px; font-weight: bold; color: #3b82f6;">${stats.uniqueIPs}</p>
              <p style="margin: 5px 0 0; font-size: 12px; color: #6b7280;">IP-uri Unice</p>
            </div>
            <div style="flex: 1; min-width: 120px; background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0; font-size: 28px; font-weight: bold; color: #dc2626;">${stats.blockedIPs}</p>
              <p style="margin: 5px 0 0; font-size: 12px; color: #6b7280;">IP-uri Blocate</p>
            </div>
            <div style="flex: 1; min-width: 120px; background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0; font-size: 28px; font-weight: bold; color: #f59e0b;">${stats.alertsTriggered}</p>
              <p style="margin: 5px 0 0; font-size: 12px; color: #6b7280;">Alerte</p>
            </div>
          </div>

          <!-- Severity Badge -->
          <div style="background: ${severityColor}20; border-left: 4px solid ${severityColor}; padding: 12px 15px; margin-bottom: 20px; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: ${severityColor}; font-weight: bold;">
              Nivel de Amenințare: ${severityLabel}
            </p>
          </div>

          <!-- Top Targeted Resources -->
          <h3 style="color: #374151; margin: 0 0 10px;">🎯 Resurse Vizate</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background: white;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: left;">Resursă</th>
                <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: center; width: 80px;">Încercări</th>
              </tr>
            </thead>
            <tbody>
              ${resourceRows}
            </tbody>
          </table>

          <!-- Top Offending IPs -->
          <h3 style="color: #374151; margin: 0 0 10px;">🔍 IP-uri Suspecte (Top 10)</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background: white;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: left;">Adresă IP</th>
                <th style="padding: 10px; border: 1px solid #e5e7eb; text-align: center; width: 80px;">Încercări</th>
              </tr>
            </thead>
            <tbody>
              ${ipRows}
            </tbody>
          </table>

          ${blockedSection}

          <p style="margin: 20px 0 0; font-size: 14px; color: #6b7280; text-align: center;">
            Verifică panoul de administrare pentru detalii complete.
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
        subject: `📊 Raport Securitate ${reportDate} - ${stats.totalAttempts} tentative detectate`,
        html: htmlContent,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Failed to send daily security report:", errorText);
      throw new Error(`Email send failed: ${errorText}`);
    }

    console.log(`Daily security report sent to ${adminEmails.length} admins`);

    // Log the report sending
    await supabase.from("audit_logs").insert({
      action: "DAILY_REPORT_SENT",
      resource: "daily-security-report",
      details: {
        recipients: adminEmails.length,
        stats: stats,
      },
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Daily report sent to ${adminEmails.length} admins`,
        stats
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error in daily-security-report function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
