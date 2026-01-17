import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

const getWelcomeDay3Email = (userName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">👋 Salut${userName ? `, ${userName}` : ''}!</h1>
    </div>
    
    <div style="background-color: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #374151; margin-top: 0;">Cum ți se pare StudyBuddy până acum?</h2>
      
      <p style="color: #6b7280; line-height: 1.6;">
        Au trecut câteva zile de când te-ai alăturat comunității noastre și suntem curioși să aflăm cum a fost experiența ta!
      </p>
      
      <p style="color: #6b7280; line-height: 1.6;">
        Iată câteva lucruri pe care le poți face pe platformă:
      </p>
      
      <ul style="color: #6b7280; line-height: 1.8; padding-left: 20px;">
        <li>🔍 <strong>Caută colegi</strong> de studiu cu interese similare</li>
        <li>📝 <strong>Completează-ți profilul</strong> pentru a fi găsit mai ușor</li>
        <li>💬 <strong>Trimite un mesaj</strong> colegilor tăi</li>
        <li>📍 <strong>Descoperă locații</strong> de studiu în Bucuresti</li>
        <li>👥 <strong>Creează sau alătură-te</strong> unui grup de studiu</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://www.studybuddy.ro" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
          Explorează StudyBuddy
        </a>
      </div>
      
      <p style="color: #6b7280; line-height: 1.6;">
        Dacă ai întrebări sau sugestii, nu ezita să ne contactezi. Suntem aici să te ajutăm! 💜
      </p>
      
      ${getEmailSignature()}
    </div>
  </div>
</body>
</html>
`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Starting retention email job...');

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!RESEND_API_KEY) {
      console.log('RESEND_API_KEY not configured - retention emails disabled');
      return new Response(
        JSON.stringify({ success: false, message: 'RESEND_API_KEY not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase configuration');
    }

    // Use service role to access all profiles and automated_emails_log
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Calculate the date 3 days ago
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const threeDaysAgoISO = threeDaysAgo.toISOString();

    console.log(`Looking for users created before: ${threeDaysAgoISO}`);

    // Get all users who were created more than 3 days ago
    const { data: eligibleProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .lt('created_at', threeDaysAgoISO);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    if (!eligibleProfiles || eligibleProfiles.length === 0) {
      console.log('No eligible users found');
      return new Response(
        JSON.stringify({ success: true, message: 'No eligible users', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    console.log(`Found ${eligibleProfiles.length} profiles created > 3 days ago`);

    // Get users who already received the welcome_day_3 email
    const { data: alreadySent, error: logError } = await supabase
      .from('automated_emails_log')
      .select('user_id')
      .eq('email_type', 'welcome_day_3');

    if (logError) {
      console.error('Error fetching email logs:', logError);
      throw logError;
    }

    const alreadySentUserIds = new Set((alreadySent || []).map(entry => entry.user_id));
    console.log(`${alreadySentUserIds.size} users already received welcome_day_3 email`);

    // Filter users who haven't received the email yet
    const usersToEmail = eligibleProfiles.filter(
      profile => profile.email && !alreadySentUserIds.has(profile.id)
    );

    console.log(`${usersToEmail.length} users to send welcome_day_3 email`);

    if (usersToEmail.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'All eligible users already emailed', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    let sentCount = 0;
    let failedCount = 0;

    // Send emails and log them
    for (const user of usersToEmail) {
      try {
        const firstName = user.full_name?.split(' ')[0] || '';
        
        // Send email via Resend API
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'StudyBuddy <contact@studybuddy.ro>',
            to: [user.email],
            subject: 'Cum ți se pare StudyBuddy până acum? 🎓',
            html: getWelcomeDay3Email(firstName),
          }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Resend API error: ${errorText}`);
        }

        const emailResult = await res.json();
        console.log(`Email sent to ${user.email}:`, emailResult);

        // Log the sent email
        const { error: insertError } = await supabase
          .from('automated_emails_log')
          .insert({
            user_id: user.id,
            email_type: 'welcome_day_3',
          });

        if (insertError) {
          console.error(`Error logging email for user ${user.id}:`, insertError);
        }

        sentCount++;
      } catch (emailError) {
        console.error(`Failed to send email to ${user.email}:`, emailError);
        failedCount++;
      }
    }

    console.log(`Retention email job completed. Sent: ${sentCount}, Failed: ${failedCount}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: sentCount, 
        failed: failedCount,
        message: `Sent ${sentCount} emails, ${failedCount} failed`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: unknown) {
    console.error('Error in retention email job:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
