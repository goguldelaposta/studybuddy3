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

interface NewsletterRequest {
  subject: string;
  message: string;
}

// Helper function to log audit events
// deno-lint-ignore no-explicit-any
const logAuditEvent = async (
  supabaseClient: any,
  action: string,
  userId: string | null,
  resource: string,
  req: Request,
  details?: Record<string, unknown>
) => {
  try {
    await supabaseClient.from("audit_logs").insert({
      action,
      user_id: userId,
      ip_address: req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown",
      user_agent: req.headers.get("user-agent") || "unknown",
      resource,
      details: details || null,
    });
  } catch (err) {
    console.error("Failed to log audit event:", err);
  }
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  // Initialize supabase client early for logging
  const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    : null;

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      console.log("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Sistemul de email nu este configurat."
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!supabase) {
      throw new Error("Missing Supabase configuration");
    }

    // Verify the request is from an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      // Log unauthorized access attempt
      if (supabase) {
        await logAuditEvent(
          supabase,
          "UNAUTHORIZED_ACCESS_ATTEMPT",
          null,
          "/admin/newsletter",
          req,
          { reason: "missing_auth_header" }
        );
      }
      return new Response(
        JSON.stringify({ success: false, error: "Autorizare necesară" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get the user from the token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      // Log failed authentication
      if (supabase) {
        await logAuditEvent(
          supabase,
          "failed_auth",
          null,
          "/admin/newsletter",
          req,
          { reason: "invalid_token", error: authError?.message }
        );
      }
      return new Response(
        JSON.stringify({ success: false, error: "Sesiune invalidă" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if user is admin
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin");

    if (!roles || roles.length === 0) {
      // Log permission denied - user trying to access admin function
      await logAuditEvent(
        supabase,
        "UNAUTHORIZED_ACCESS_ATTEMPT",
        user.id,
        "/admin/newsletter",
        req,
        { reason: "not_admin", user_email: user.email }
      );
      return new Response(
        JSON.stringify({ success: false, error: "Doar administratorii pot trimite newsletter-uri" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { subject, message, testEmail }: NewsletterRequest & { testEmail?: string } = await req.json();

    if (!subject || !message) {
      return new Response(
        JSON.stringify({ success: false, error: "Subiectul și mesajul sunt obligatorii" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch all user emails from profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("email, full_name");

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw new Error("Nu s-au putut prelua adresele de email");
    }

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Nu există utilizatori în baza de date" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // If testEmail is provided, send only to that address
    const recipientEmails = testEmail
      ? [testEmail]
      : profiles.map((p) => p.email).filter(Boolean);

    console.log(testEmail
      ? `TEST MODE: Sending only to ${testEmail}`
      : `Sending newsletter to ${profiles.length} users`
    );

    // Fully inlined HTML for Gmail/Outlook compatibility
    const htmlContent = `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>StudyBuddy Newsletter</title>
</head>
<body style="margin:0;padding:0;font-family:'Helvetica Neue',Arial,sans-serif;background-color:#f0f4ff;color:#1e2a4a;-webkit-text-size-adjust:100%;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f4ff;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 12px 48px -12px rgba(37,99,235,0.18);">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 50%,#0d9488 100%);padding:48px 40px 56px;text-align:center;">
              <div style="margin-bottom:16px;">
                <span style="font-size:26px;font-weight:800;color:#ffffff;font-family:'Helvetica Neue',Arial,sans-serif;">📚 StudyBuddy</span>
              </div>
              <div style="display:inline-block;background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.4);color:#ffffff;font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;padding:6px 16px;border-radius:100px;margin-bottom:20px;">✨ Noutăți din comunitate</div>
              <h1 style="font-size:32px;font-weight:800;color:#ffffff;line-height:1.2;margin:0 0 12px;font-family:'Helvetica Neue',Arial,sans-serif;">Învățarea e mai ușoară<br/>împreună!</h1>
              <p style="font-size:16px;color:rgba(255,255,255,0.85);margin:0;line-height:1.6;">Bine ai venit în comunitatea StudyBuddy —<br/>platforma creată pentru studenții din România.</p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="font-size:18px;font-weight:600;color:#1e2a4a;margin:0 0 12px;font-family:'Helvetica Neue',Arial,sans-serif;">Salut! 👋</p>
              <p style="font-size:15px;color:#4b5a7a;line-height:1.7;margin:0 0 32px;font-family:'Helvetica Neue',Arial,sans-serif;">Suntem bucuroși că faci parte din comunitatea noastră în creștere. StudyBuddy este platforma unde studenții din România se conectează, formează grupuri de studiu și se ajută reciproc să treacă peste sesiunile de examene. Iată ce e nou și ce te poate ajuta:</p>

              <p style="font-size:20px;font-weight:700;color:#1e2a4a;margin:0 0 16px;font-family:'Helvetica Neue',Arial,sans-serif;">🚀 Ce poți face pe StudyBuddy</p>

              <!-- Feature Card 1 -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8faff;border:1px solid #e2e8f8;border-radius:16px;margin-bottom:12px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align:top;padding-right:16px;">
                          <div style="width:44px;height:44px;min-width:44px;border-radius:12px;background:linear-gradient(135deg,#2563eb,#3b82f6);text-align:center;line-height:44px;font-size:20px;">👥</div>
                        </td>
                        <td style="vertical-align:top;">
                          <p style="font-size:15px;font-weight:700;color:#1e2a4a;margin:0 0 4px;font-family:'Helvetica Neue',Arial,sans-serif;">Grupuri de studiu pe cursuri</p>
                          <p style="font-size:13px;color:#64748b;line-height:1.6;margin:0;font-family:'Helvetica Neue',Arial,sans-serif;">Găsește sau creează grupuri organizate pe facultate și materie. Studiați sincronizat, împărtășiți note și resurse.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Feature Card 2 -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8faff;border:1px solid #e2e8f8;border-radius:16px;margin-bottom:12px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align:top;padding-right:16px;">
                          <div style="width:44px;height:44px;min-width:44px;border-radius:12px;background:linear-gradient(135deg,#0d9488,#14b8a6);text-align:center;line-height:44px;font-size:20px;">💬</div>
                        </td>
                        <td style="vertical-align:top;">
                          <p style="font-size:15px;font-weight:700;color:#1e2a4a;margin:0 0 4px;font-family:'Helvetica Neue',Arial,sans-serif;">Mesagerie în timp real</p>
                          <p style="font-size:13px;color:#64748b;line-height:1.6;margin:0;font-family:'Helvetica Neue',Arial,sans-serif;">Comunică direct cu colegii din grup. Schimb de idei, clarificări și sprijin reciproc — tot în aplicație.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Feature Card 3 -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8faff;border:1px solid #e2e8f8;border-radius:16px;margin-bottom:12px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align:top;padding-right:16px;">
                          <div style="width:44px;height:44px;min-width:44px;border-radius:12px;background:linear-gradient(135deg,#f97316,#fb923c);text-align:center;line-height:44px;font-size:20px;">🚧</div>
                        </td>
                        <td style="vertical-align:top;">
                          <p style="font-size:15px;font-weight:700;color:#1e2a4a;margin:0 0 4px;font-family:'Helvetica Neue',Arial,sans-serif;">Aplicații native — în lucru!</p>
                          <p style="font-size:13px;color:#64748b;line-height:1.6;margin:0;font-family:'Helvetica Neue',Arial,sans-serif;">Lucrăm activ la aplicațiile native pentru <strong>iOS</strong>, <strong>Android</strong> și <strong>PC</strong>. Lansarea se apropie — rămâi pe fază!</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Feature Card 4 -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8faff;border:1px solid #e2e8f8;border-radius:16px;margin-bottom:32px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="vertical-align:top;padding-right:16px;">
                          <div style="width:44px;height:44px;min-width:44px;border-radius:12px;background:linear-gradient(135deg,#7c3aed,#a855f7);text-align:center;line-height:44px;font-size:20px;">🔒</div>
                        </td>
                        <td style="vertical-align:top;">
                          <p style="font-size:15px;font-weight:700;color:#1e2a4a;margin:0 0 4px;font-family:'Helvetica Neue',Arial,sans-serif;">Autentificare sigură</p>
                          <p style="font-size:13px;color:#64748b;line-height:1.6;margin:0;font-family:'Helvetica Neue',Arial,sans-serif;">Cont securizat cu adresa de email. Datele tale sunt protejate și confidențiale.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Tip Box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fffbeb;border-left:4px solid #f59e0b;border-radius:0 12px 12px 0;margin-bottom:32px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="font-size:14px;font-weight:700;color:#92400e;margin:0 0 4px;font-family:'Helvetica Neue',Arial,sans-serif;">💡 Sfatul săptămânii</p>
                    <p style="font-size:13px;color:#78350f;line-height:1.6;margin:0;font-family:'Helvetica Neue',Arial,sans-serif;">Grupurile de studiu cu 3-5 membri s-au dovedit a fi cele mai eficiente! Caută colegi de la aceeași facultate și materie și stabiliți sesiuni fixe de studiu.</p>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
                <tr><td style="border-top:1px solid #e2e8f8;font-size:0;">&nbsp;</td></tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="text-align:center;margin-bottom:32px;">
                <tr>
                  <td align="center">
                    <p style="font-size:22px;font-weight:800;color:#1e2a4a;margin:0 0 8px;font-family:'Helvetica Neue',Arial,sans-serif;">Ești gata să înveți mai bine?</p>
                    <p style="font-size:14px;color:#64748b;margin:0 0 24px;line-height:1.6;font-family:'Helvetica Neue',Arial,sans-serif;">Accesează acum platforma, alătură-te unui grup de studiu<br/>sau creează-ți propriul grup pentru colegii tăi.</p>
                    <a href="https://studybuddy.ro" style="display:inline-block;background:linear-gradient(135deg,#2563eb 0%,#0d9488 100%);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:16px 40px;border-radius:100px;font-family:'Helvetica Neue',Arial,sans-serif;">Deschide StudyBuddy →</a>
                    <p style="font-size:12px;color:#94a3b8;margin:14px 0 0;font-family:'Helvetica Neue',Arial,sans-serif;">Gratuit pentru toți studenții din România 🇷🇴</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#f8faff;border-top:1px solid #e2e8f8;padding:28px 40px;text-align:center;">
              <p style="font-size:18px;font-weight:800;color:#2563eb;margin:0 0 12px;font-family:'Helvetica Neue',Arial,sans-serif;">📚 StudyBuddy</p>
              <p style="margin:0 0 16px;">
                <a href="https://studybuddy.ro" style="color:#64748b;text-decoration:none;font-size:13px;margin:0 10px;font-family:'Helvetica Neue',Arial,sans-serif;">Website</a>
                <a href="https://studybuddy.ro/groups" style="color:#64748b;text-decoration:none;font-size:13px;margin:0 10px;font-family:'Helvetica Neue',Arial,sans-serif;">Grupuri</a>
                <a href="https://studybuddy.ro/messages" style="color:#64748b;text-decoration:none;font-size:13px;margin:0 10px;font-family:'Helvetica Neue',Arial,sans-serif;">Mesaje</a>
                <a href="mailto:contact@studybuddy.ro" style="color:#64748b;text-decoration:none;font-size:13px;margin:0 10px;font-family:'Helvetica Neue',Arial,sans-serif;">Contact</a>
              </p>
              <p style="font-size:12px;color:#94a3b8;line-height:1.7;margin:0;font-family:'Helvetica Neue',Arial,sans-serif;">
                Ai primit acest email deoarece ești înregistrat pe StudyBuddy.<br/>
                © 2026 StudyBuddy · Platformă de colaborare academică pentru România 🇷🇴
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // Send emails in batches to avoid rate limits
    const BATCH_SIZE = 50;
    let sentCount = 0;
    let failedCount = 0;

    for (let i = 0; i < recipientEmails.length; i += BATCH_SIZE) {
      const emails = recipientEmails.slice(i, i + BATCH_SIZE);

      if (emails.length === 0) continue;

      try {
        // Resend supports up to 50 recipients per API call
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "StudyBuddy <contact@studybuddy.ro>",
            to: emails,
            subject: subject,
            html: htmlContent,
          }),
        });

        if (res.ok) {
          sentCount += emails.length;
          console.log(`Batch sent successfully: ${emails.length} emails`);
        } else {
          const errorText = await res.text();
          console.error(`Batch failed: ${errorText}`);
          failedCount += emails.length;
        }
      } catch (batchError) {
        console.error("Batch error:", batchError);
        failedCount += emails.length;
      }

      // Small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < recipientEmails.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    console.log(`Newsletter completed: ${sentCount} sent, ${failedCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        sentCount,
        failedCount,
        message: `Newsletter trimis către ${sentCount} utilizatori`
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error in send-newsletter function:", error);
    const errorMessage = error instanceof Error ? error.message : "Eroare necunoscută";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
