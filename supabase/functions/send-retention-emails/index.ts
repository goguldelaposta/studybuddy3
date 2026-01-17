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

// Welcome Day 3 Email
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

// Welcome Day 7 Email - Encourages group creation
const getWelcomeDay7Email = (userName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">👥 Hai să formăm un grup de studiu!</h1>
    </div>
    
    <div style="background-color: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #374151; margin-top: 0;">Salut${userName ? `, ${userName}` : ''}! 🎓</h2>
      
      <p style="color: #6b7280; line-height: 1.6;">
        A trecut o săptămână de când ești parte din comunitatea StudyBuddy! Sperăm că ai avut ocazia să explorezi platforma.
      </p>
      
      <p style="color: #6b7280; line-height: 1.6;">
        <strong>Știai că poți crea un grup de studiu?</strong> Grupurile sunt o modalitate excelentă de a:
      </p>
      
      <ul style="color: #6b7280; line-height: 1.8; padding-left: 20px;">
        <li>📚 <strong>Organiza sesiuni</strong> de învățat cu colegi de la aceeași facultate</li>
        <li>🤝 <strong>Colabora la proiecte</strong> și teme de grup</li>
        <li>💡 <strong>Împărtăși resurse</strong> și materiale de studiu</li>
        <li>🎯 <strong>Te motiva reciproc</strong> pentru examene și evaluări</li>
      </ul>
      
      <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); padding: 20px; border-radius: 12px; margin: 20px 0;">
        <p style="color: #374151; margin: 0; text-align: center; font-weight: 500;">
          💡 Sfat: Grupurile cu 3-5 membri sunt cele mai eficiente pentru învățat!
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://www.studybuddy.ro/groups" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
          Creează un Grup de Studiu
        </a>
      </div>
      
      <p style="color: #6b7280; line-height: 1.6;">
        Nu uita să-ți inviți colegii să se alăture grupului tău! Împreună învățăm mai ușor. 🚀
      </p>
      
      ${getEmailSignature()}
    </div>
  </div>
</body>
</html>
`;

// Re-engagement Email for 30+ days inactive users
const getReengagement30Email = (userName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">🌟 Ne-ai lipsit!</h1>
    </div>
    
    <div style="background-color: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #374151; margin-top: 0;">Salut${userName ? `, ${userName}` : ''}! 👋</h2>
      
      <p style="color: #6b7280; line-height: 1.6;">
        Am observat că nu te-ai mai conectat pe StudyBuddy de ceva vreme și am vrut să vedem dacă totul este în regulă.
      </p>
      
      <p style="color: #6b7280; line-height: 1.6;">
        <strong>Între timp, s-au întâmplat multe pe platformă:</strong>
      </p>
      
      <ul style="color: #6b7280; line-height: 1.8; padding-left: 20px;">
        <li>✨ <strong>Colegi noi</strong> s-au alăturat comunității</li>
        <li>📍 <strong>Noi locații</strong> de studiu au fost adăugate pe hartă</li>
        <li>👥 <strong>Grupuri noi</strong> de studiu au fost create</li>
        <li>💬 <strong>Conversații interesante</strong> au loc zilnic</li>
      </ul>
      
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #f59e0b;">
        <p style="color: #92400e; margin: 0; text-align: center;">
          🎓 Semestrul este în toi - nu rata ocazia de a găsi colegi pentru sesiune!
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://www.studybuddy.ro" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
          Revino pe StudyBuddy
        </a>
      </div>
      
      <p style="color: #6b7280; line-height: 1.6;">
        Te așteptăm înapoi! Dacă ai nevoie de ajutor sau ai întrebări, suntem mereu aici pentru tine.
      </p>
      
      <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin-top: 20px;">
        P.S. Dacă nu mai dorești să primești emailuri de la noi, ne poți contacta la contact@studybuddy.ro
      </p>
      
      ${getEmailSignature()}
    </div>
  </div>
</body>
</html>
`;

interface EmailConfig {
  type: string;
  subject: string;
  daysThreshold: number;
  getEmailHtml: (userName: string) => string;
  checkField: 'created_at' | 'last_seen';
}

const emailConfigs: EmailConfig[] = [
  {
    type: 'welcome_day_3',
    subject: 'Cum ți se pare StudyBuddy până acum? 🎓',
    daysThreshold: 3,
    getEmailHtml: getWelcomeDay3Email,
    checkField: 'created_at',
  },
  {
    type: 'welcome_day_7',
    subject: 'Hai să creăm un grup de studiu! 👥',
    daysThreshold: 7,
    getEmailHtml: getWelcomeDay7Email,
    checkField: 'created_at',
  },
  {
    type: 'reengagement_30',
    subject: 'Ne-ai lipsit! Revino pe StudyBuddy 🌟',
    daysThreshold: 30,
    getEmailHtml: getReengagement30Email,
    checkField: 'last_seen',
  },
];

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

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const results: { type: string; sent: number; failed: number }[] = [];

    // Process each email type
    for (const config of emailConfigs) {
      console.log(`Processing ${config.type} emails...`);

      // Calculate threshold date
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() - config.daysThreshold);
      const thresholdISO = thresholdDate.toISOString();

      console.log(`Looking for users with ${config.checkField} before: ${thresholdISO}`);

      // Get eligible profiles
      let query = supabase
        .from('profiles')
        .select('id, full_name, email, last_seen')
        .lt(config.checkField, thresholdISO);

      // For re-engagement, only target users who have logged in at some point
      if (config.type === 'reengagement_30') {
        query = query.not('last_seen', 'is', null);
      }

      const { data: eligibleProfiles, error: profilesError } = await query;

      if (profilesError) {
        console.error(`Error fetching profiles for ${config.type}:`, profilesError);
        continue;
      }

      if (!eligibleProfiles || eligibleProfiles.length === 0) {
        console.log(`No eligible users for ${config.type}`);
        results.push({ type: config.type, sent: 0, failed: 0 });
        continue;
      }

      console.log(`Found ${eligibleProfiles.length} profiles for ${config.type}`);

      // Get users who already received this email type
      const { data: alreadySent, error: logError } = await supabase
        .from('automated_emails_log')
        .select('user_id')
        .eq('email_type', config.type);

      if (logError) {
        console.error(`Error fetching email logs for ${config.type}:`, logError);
        continue;
      }

      const alreadySentUserIds = new Set((alreadySent || []).map(entry => entry.user_id));
      console.log(`${alreadySentUserIds.size} users already received ${config.type} email`);

      // Filter users who haven't received the email yet
      const usersToEmail = eligibleProfiles.filter(
        profile => profile.email && !alreadySentUserIds.has(profile.id)
      );

      console.log(`${usersToEmail.length} users to send ${config.type} email`);

      let sentCount = 0;
      let failedCount = 0;

      // Send emails
      for (const user of usersToEmail) {
        try {
          const firstName = user.full_name?.split(' ')[0] || '';

          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: 'StudyBuddy <contact@studybuddy.ro>',
              to: [user.email],
              subject: config.subject,
              html: config.getEmailHtml(firstName),
            }),
          });

          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Resend API error: ${errorText}`);
          }

          const emailResult = await res.json();
          console.log(`${config.type} email sent to ${user.email}:`, emailResult);

          // Log the sent email
          const { error: insertError } = await supabase
            .from('automated_emails_log')
            .insert({
              user_id: user.id,
              email_type: config.type,
            });

          if (insertError) {
            console.error(`Error logging email for user ${user.id}:`, insertError);
          }

          sentCount++;
        } catch (emailError) {
          console.error(`Failed to send ${config.type} email to ${user.email}:`, emailError);
          failedCount++;
        }
      }

      results.push({ type: config.type, sent: sentCount, failed: failedCount });
    }

    console.log('Retention email job completed:', results);

    const totalSent = results.reduce((acc, r) => acc + r.sent, 0);
    const totalFailed = results.reduce((acc, r) => acc + r.failed, 0);

    return new Response(
      JSON.stringify({
        success: true,
        results,
        summary: {
          totalSent,
          totalFailed,
          message: `Sent ${totalSent} emails, ${totalFailed} failed`,
        },
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
