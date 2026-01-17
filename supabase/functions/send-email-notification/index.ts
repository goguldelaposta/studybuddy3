import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  type?: 'welcome' | 'notification' | 'friend_request' | 'message' | 'badge_earned';
}

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    
    if (!RESEND_API_KEY) {
      console.log('RESEND_API_KEY not configured - email notifications disabled');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Email notifications not configured. Add RESEND_API_KEY to enable.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const { to, subject, html, type } = await req.json() as EmailRequest;

    if (!to || !subject || !html) {
      throw new Error('Missing required fields: to, subject, html');
    }

    // Add signature to all emails
    const htmlWithSignature = html + getEmailSignature();

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'StudyBuddy <contact@studybuddy.ro>',
        to: [to],
        subject,
        html: htmlWithSignature,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Failed to send email: ${error}`);
    }

    const data = await res.json();
    console.log(`Email sent successfully to ${to}, type: ${type || 'general'}`);

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error sending email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
