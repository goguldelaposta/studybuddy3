import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Nu ești autentificat" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's auth token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Client for getting user info
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    
    if (userError || !user) {
      console.error("Error getting user:", userError);
      return new Response(
        JSON.stringify({ error: "Nu s-a putut verifica utilizatorul" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Deleting account for user: ${user.id}`);

    // Use service role client for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Delete related data first (in order of dependencies)
    
    // 1. Delete message reactions
    const { error: reactionsError } = await supabaseAdmin
      .from("message_reactions")
      .delete()
      .eq("user_id", user.id);
    if (reactionsError) console.log("Error deleting reactions:", reactionsError.message);

    // 2. Delete messages
    const { error: messagesError } = await supabaseAdmin
      .from("messages")
      .delete()
      .eq("sender_id", user.id);
    if (messagesError) console.log("Error deleting messages:", messagesError.message);

    // 3. Delete conversations
    const { error: conv1Error } = await supabaseAdmin
      .from("conversations")
      .delete()
      .eq("participant_1", user.id);
    if (conv1Error) console.log("Error deleting conversations (p1):", conv1Error.message);
    
    const { error: conv2Error } = await supabaseAdmin
      .from("conversations")
      .delete()
      .eq("participant_2", user.id);
    if (conv2Error) console.log("Error deleting conversations (p2):", conv2Error.message);

    // 4. Delete friendships
    const { error: friend1Error } = await supabaseAdmin
      .from("friendships")
      .delete()
      .eq("requester_id", user.id);
    if (friend1Error) console.log("Error deleting friendships (req):", friend1Error.message);
    
    const { error: friend2Error } = await supabaseAdmin
      .from("friendships")
      .delete()
      .eq("addressee_id", user.id);
    if (friend2Error) console.log("Error deleting friendships (addr):", friend2Error.message);

    // 5. Delete group memberships
    const { error: groupMembersError } = await supabaseAdmin
      .from("group_members")
      .delete()
      .eq("user_id", user.id);
    if (groupMembersError) console.log("Error deleting group members:", groupMembersError.message);

    // 6. Delete groups created by user
    const { error: groupsError } = await supabaseAdmin
      .from("groups")
      .delete()
      .eq("created_by", user.id);
    if (groupsError) console.log("Error deleting groups:", groupsError.message);

    // 7. Delete announcements
    const { error: announcementsError } = await supabaseAdmin
      .from("announcements")
      .delete()
      .eq("user_id", user.id);
    if (announcementsError) console.log("Error deleting announcements:", announcementsError.message);

    // 8. Delete user badges
    const { error: badgesError } = await supabaseAdmin
      .from("user_badges")
      .delete()
      .eq("user_id", user.id);
    if (badgesError) console.log("Error deleting user badges:", badgesError.message);

    // 9. Delete profile skills
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();
    
    if (profile) {
      const { error: skillsError } = await supabaseAdmin
        .from("profile_skills")
        .delete()
        .eq("profile_id", profile.id);
      if (skillsError) console.log("Error deleting profile skills:", skillsError.message);

      const { error: subjectsError } = await supabaseAdmin
        .from("profile_subjects")
        .delete()
        .eq("profile_id", profile.id);
      if (subjectsError) console.log("Error deleting profile subjects:", subjectsError.message);
    }

    // 10. Delete user roles
    const { error: rolesError } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", user.id);
    if (rolesError) console.log("Error deleting user roles:", rolesError.message);

    // 11. Delete user suspensions
    const { error: suspensionsError } = await supabaseAdmin
      .from("user_suspensions")
      .delete()
      .eq("user_id", user.id);
    if (suspensionsError) console.log("Error deleting suspensions:", suspensionsError.message);

    // 12. Delete profile
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("user_id", user.id);
    if (profileError) console.log("Error deleting profile:", profileError.message);

    // 13. Delete storage files (avatars)
    const { error: storageError } = await supabaseAdmin.storage
      .from("avatars")
      .remove([`${user.id}/`]);
    if (storageError) console.log("Error deleting avatar storage:", storageError.message);

    // 14. Finally, delete the auth user
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    
    if (deleteUserError) {
      console.error("Error deleting auth user:", deleteUserError);
      return new Response(
        JSON.stringify({ error: "Nu s-a putut șterge contul. Încearcă din nou." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully deleted account for user: ${user.id}`);

    return new Response(
      JSON.stringify({ success: true, message: "Contul a fost șters cu succes" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "A apărut o eroare neașteptată" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
