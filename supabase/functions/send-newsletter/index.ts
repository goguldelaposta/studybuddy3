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

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

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

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase configuration");
    }

    // Verify the request is from an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Autorizare necesară" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get the user from the token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
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
      return new Response(
        JSON.stringify({ success: false, error: "Doar administratorii pot trimite newsletter-uri" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { subject, message }: NewsletterRequest = await req.json();

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

    console.log(`Sending newsletter to ${profiles.length} users`);

    // Format message with line breaks
    const formattedMessage = message.replace(/\n/g, "<br>");

    // Build HTML content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">${subject}</h1>
        </div>
        <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <div style="background: white; padding: 20px; border-radius: 4px; border: 1px solid #e5e7eb;">
            <p style="margin: 0; line-height: 1.6;">${formattedMessage}</p>
          </div>
          ${getEmailSignature()}
        </div>
      </div>
    `;

    // Send emails in batches to avoid rate limits
    const BATCH_SIZE = 50;
    let sentCount = 0;
    let failedCount = 0;

    for (let i = 0; i < profiles.length; i += BATCH_SIZE) {
      const batch = profiles.slice(i, i + BATCH_SIZE);
      const emails = batch.map((p) => p.email).filter(Boolean);

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
      if (i + BATCH_SIZE < profiles.length) {
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
