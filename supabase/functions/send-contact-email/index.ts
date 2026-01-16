import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactFormRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    if (!RESEND_API_KEY) {
      console.log("RESEND_API_KEY not configured - contact form disabled");
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Sistemul de email nu este configurat. Te rugăm să încerci din nou mai târziu." 
        }),
        { 
          status: 200, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    const { name, email, subject, message }: ContactFormRequest = await req.json();

    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Toate câmpurile sunt obligatorii." }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    // Send notification to admin
    const adminEmailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "StudyBuddy <onboarding@resend.dev>",
        to: ["contact@studybuddy.ro"],
        subject: `[Contact] ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Mesaj nou de contact</h1>
            </div>
            <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 10px;"><strong>De la:</strong> ${name}</p>
              <p style="margin: 0 0 10px;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              <p style="margin: 0 0 10px;"><strong>Subiect:</strong> ${subject}</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="margin: 0 0 10px;"><strong>Mesaj:</strong></p>
              <div style="background: white; padding: 15px; border-radius: 4px; border: 1px solid #e5e7eb;">
                <p style="margin: 0; white-space: pre-wrap;">${message}</p>
              </div>
            </div>
          </div>
        `,
        reply_to: email,
      }),
    });

    if (!adminEmailRes.ok) {
      const errorText = await adminEmailRes.text();
      console.error("Failed to send admin email:", errorText);
      throw new Error("Nu am putut trimite emailul.");
    }

    console.log("Admin notification sent successfully");

    // Send confirmation to user
    const userEmailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "StudyBuddy <onboarding@resend.dev>",
        to: [email],
        subject: "Am primit mesajul tău - StudyBuddy",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Mulțumim pentru mesaj!</h1>
            </div>
            <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
              <p>Salut ${name},</p>
              <p>Îți mulțumim că ne-ai contactat! Am primit mesajul tău și îți vom răspunde cât mai curând posibil.</p>
              <p><strong>Subiect:</strong> ${subject}</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="color: #6b7280; font-size: 14px;">
                Cu drag,<br>
                Echipa StudyBuddy
              </p>
            </div>
          </div>
        `,
      }),
    });

    if (!userEmailRes.ok) {
      console.error("Failed to send user confirmation:", await userEmailRes.text());
      // Don't throw - admin email was sent successfully
    } else {
      console.log("User confirmation sent successfully");
    }

    return new Response(
      JSON.stringify({ success: true, message: "Mesajul a fost trimis cu succes!" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    console.error("Error in send-contact-email function:", error);
    const errorMessage = error instanceof Error ? error.message : "Eroare necunoscută";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
