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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Fetch profile first
    const profileResult = await supabaseClient.from('profiles').select('*').eq('user_id', user.id).single();
    const profileId = profileResult.data?.id;

    // Fetch all other user data in parallel
    const [
      messagesResult,
      friendshipsResult,
      groupMembersResult,
      announcementsResult,
      badgesResult,
      skillsResult,
      subjectsResult
    ] = await Promise.all([
      supabaseClient.from('messages').select('*').eq('sender_id', user.id),
      supabaseClient.from('friendships').select('*').or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`),
      supabaseClient.from('group_members').select('*, groups(name, description)').eq('user_id', user.id),
      supabaseClient.from('announcements').select('*').eq('user_id', user.id),
      supabaseClient.from('user_badges').select('*, badges(name, description, category)').eq('user_id', user.id),
      profileId ? supabaseClient.from('profile_skills').select('*, skills(name, category)').eq('profile_id', profileId) : Promise.resolve({ data: [] }),
      profileId ? supabaseClient.from('profile_subjects').select('*, subjects(name, faculty)').eq('profile_id', profileId) : Promise.resolve({ data: [] }),
    ]);

    const exportData = {
      exportDate: new Date().toISOString(),
      userId: user.id,
      email: user.email,
      profile: profileResult.data,
      messages: messagesResult.data || [],
      friendships: friendshipsResult.data || [],
      groupMemberships: groupMembersResult.data || [],
      announcements: announcementsResult.data || [],
      badges: badgesResult.data || [],
      skills: skillsResult.data || [],
      subjects: subjectsResult.data || [],
    };

    console.log(`User data exported for: ${user.email}`);

    return new Response(
      JSON.stringify(exportData, null, 2),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="studybuddy-data-export-${new Date().toISOString().split('T')[0]}.json"`
        } 
      }
    );
  } catch (error: unknown) {
    console.error('Error exporting user data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
