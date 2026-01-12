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

    // Verify user is admin
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { data: roles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = roles?.some(r => r.role === 'admin');
    if (!isAdmin) {
      throw new Error('Admin access required');
    }

    // Use service role for counting
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Fetch all stats in parallel
    const [
      profilesTotal,
      profilesWeek,
      groupsTotal,
      groupsPublic,
      announcementsTotal,
      announcementsActive,
      messagesTotal,
      messagesWeek,
      friendshipsAccepted,
      badgesEarned,
      reportsOpen,
      suspensionsActive,
      universitiesCount,
      subjectsCount,
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', lastWeek),
      supabaseAdmin.from('groups').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('groups').select('id', { count: 'exact', head: true }).eq('is_public', true),
      supabaseAdmin.from('announcements').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('announcements').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabaseAdmin.from('messages').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('messages').select('id', { count: 'exact', head: true }).gte('created_at', lastWeek),
      supabaseAdmin.from('friendships').select('id', { count: 'exact', head: true }).eq('status', 'accepted'),
      supabaseAdmin.from('user_badges').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabaseAdmin.from('user_suspensions').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabaseAdmin.from('universities').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('subjects').select('id', { count: 'exact', head: true }),
    ]);

    // Get top universities by user count
    const { data: topUniversities } = await supabaseAdmin
      .from('profiles')
      .select('university_id, universities(name, short_name)')
      .not('university_id', 'is', null);

    const universityStats = topUniversities?.reduce((acc: Record<string, { name: string; count: number }>, profile: any) => {
      const uniId = profile.university_id;
      if (!acc[uniId]) {
        acc[uniId] = { 
          name: profile.universities?.short_name || profile.universities?.name || 'Unknown',
          count: 0 
        };
      }
      acc[uniId].count++;
      return acc;
    }, {}) || {};

    const topUnis = Object.values(universityStats)
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5);

    const stats = {
      generatedAt: now.toISOString(),
      users: {
        total: profilesTotal.count || 0,
        newThisWeek: profilesWeek.count || 0,
      },
      groups: {
        total: groupsTotal.count || 0,
        public: groupsPublic.count || 0,
      },
      announcements: {
        total: announcementsTotal.count || 0,
        active: announcementsActive.count || 0,
      },
      messages: {
        total: messagesTotal.count || 0,
        thisWeek: messagesWeek.count || 0,
      },
      social: {
        friendships: friendshipsAccepted.count || 0,
        badgesEarned: badgesEarned.count || 0,
      },
      moderation: {
        openReports: reportsOpen.count || 0,
        activeSuspensions: suspensionsActive.count || 0,
      },
      platform: {
        universities: universitiesCount.count || 0,
        subjects: subjectsCount.count || 0,
      },
      topUniversities: topUnis,
    };

    console.log('Platform stats generated');

    return new Response(
      JSON.stringify(stats),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error generating stats:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
