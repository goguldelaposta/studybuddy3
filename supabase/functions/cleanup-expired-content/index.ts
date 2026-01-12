import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const now = new Date().toISOString();
    const stats = {
      expiredAnnouncements: 0,
      liftedSuspensions: 0,
      cleanedAt: now,
    };

    // Deactivate expired announcements
    const { data: expiredAnnouncements, error: announcementsError } = await supabaseAdmin
      .from('announcements')
      .update({ is_active: false })
      .lt('expires_at', now)
      .eq('is_active', true)
      .select('id');

    if (announcementsError) {
      console.error('Error deactivating announcements:', announcementsError);
    } else {
      stats.expiredAnnouncements = expiredAnnouncements?.length || 0;
    }

    // Lift expired suspensions
    const { data: expiredSuspensions, error: suspensionsError } = await supabaseAdmin
      .from('user_suspensions')
      .update({ is_active: false, lifted_at: now })
      .lt('suspended_until', now)
      .eq('is_active', true)
      .is('lifted_at', null)
      .select('id');

    if (suspensionsError) {
      console.error('Error lifting suspensions:', suspensionsError);
    } else {
      stats.liftedSuspensions = expiredSuspensions?.length || 0;
    }

    console.log('Cleanup completed:', stats);

    return new Response(
      JSON.stringify({ success: true, stats }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in cleanup:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
