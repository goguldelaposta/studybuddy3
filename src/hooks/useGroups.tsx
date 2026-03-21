import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface Group {
  id: string;
  name: string;
  description: string | null;
  subject_id: string | null;
  university_id: string | null;
  created_by: string;
  avatar_url: string | null;
  is_public: boolean;
  max_members: number | null;
  created_at: string;
  updated_at: string;
  subject?: {
    id: string;
    name: string;
    faculty: string;
  };
  university?: {
    id: string;
    name: string;
    short_name: string;
  };
  memberCount?: number;
  isCurrentUserMember?: boolean;
  currentUserRole?: string | null;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profile?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    faculty: string;
  };
}

export interface CreateGroupData {
  name: string;
  description?: string;
  subject_id?: string;
  university_id?: string;
  is_public?: boolean;
  max_members?: number;
}

export function useGroups() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all public groups
  const fetchGroups = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: groupsData, error } = await supabase
        .from("groups")
        .select(`
          *,
          university:universities(id, name, short_name)
        `)
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Enrich with member count and membership status
      const enrichedGroups = await Promise.all(
        (groupsData || []).map(async (group) => {
          const { count } = await supabase
            .from("group_members")
            .select("*", { count: "exact", head: true })
            .eq("group_id", group.id);

          const { data: membership } = await supabase
            .from("group_members")
            .select("role")
            .eq("group_id", group.id)
            .eq("user_id", user.id)
            .maybeSingle();

          return {
            ...group,
            memberCount: count || 0,
            isCurrentUserMember: !!membership,
            currentUserRole: membership?.role || null,
          };
        })
      );

      setGroups(enrichedGroups);
    } catch (error: any) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch groups the current user is a member of
  const fetchMyGroups = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // First get all group IDs the user is a member of
      const { data: memberships, error: memberError } = await supabase
        .from("group_members")
        .select("group_id, role")
        .eq("user_id", user.id);

      if (memberError) throw memberError;

      if (!memberships || memberships.length === 0) {
        setMyGroups([]);
        setLoading(false);
        return;
      }

      const groupIds = memberships.map((m) => m.group_id);

      // Then fetch those groups
      const { data: groupsData, error } = await supabase
        .from("groups")
        .select(`
          *,
          university:universities(id, name, short_name)
        `)
        .in("id", groupIds)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // Enrich with member count
      const enrichedGroups = await Promise.all(
        (groupsData || []).map(async (group) => {
          const { count } = await supabase
            .from("group_members")
            .select("*", { count: "exact", head: true })
            .eq("group_id", group.id);

          const membership = memberships.find((m) => m.group_id === group.id);

          return {
            ...group,
            memberCount: count || 0,
            isCurrentUserMember: true,
            currentUserRole: membership?.role || null,
          };
        })
      );

      setMyGroups(enrichedGroups);
    } catch (error: any) {
      console.error("Error fetching my groups:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Create a new group
  const createGroup = useCallback(
    async (data: CreateGroupData): Promise<string | null> => {
      if (!user) return null;

      try {
        const { data: newGroup, error } = await supabase
          .from("groups")
          .insert({
            name: data.name,
            description: data.description || null,
            course_id: data.subject_id || null, // Using subject_id field to pass course_id for now
            university_id: data.university_id || null, // Keeping this for reference, though course implies uni
            created_by: user.id,
            is_public: data.is_public ?? true,
            max_members: data.max_members || 20,
          })
          .select("id")
          .single();

        if (error) throw error;

        // Add creator as admin
        const { error: memberError } = await supabase
          .from("group_members")
          .insert({
            group_id: newGroup.id,
            user_id: user.id,
            role: "admin",
          });

        if (memberError) throw memberError;

        toast({
          title: "Succes!",
          description: "Grupul a fost creat cu succes.",
        });

        // Refresh groups
        fetchGroups();
        fetchMyGroups();

        return newGroup.id;
      } catch (error: any) {
        console.error("Error creating group:", error);
        toast({
          title: "Eroare",
          description: "Nu am putut crea grupul.",
          variant: "destructive",
        });
        return null;
      }
    },
    [user, toast, fetchGroups, fetchMyGroups]
  );

  // Join a group
  const joinGroup = useCallback(
    async (groupId: string): Promise<boolean> => {
      if (!user) return false;

      try {
        const { error } = await supabase.from("group_members").insert({
          group_id: groupId,
          user_id: user.id,
          role: "member",
        });

        if (error) throw error;

        toast({
          title: "Succes!",
          description: "Te-ai alăturat grupului.",
        });

        // Refresh groups
        fetchGroups();
        fetchMyGroups();

        return true;
      } catch (error: any) {
        console.error("Error joining group:", error);
        toast({
          title: "Eroare",
          description: "Nu am putut să te alăturăm grupului.",
          variant: "destructive",
        });
        return false;
      }
    },
    [user, toast, fetchGroups, fetchMyGroups]
  );

  // Leave a group
  const leaveGroup = useCallback(
    async (groupId: string): Promise<boolean> => {
      if (!user) return false;

      try {
        const { error } = await supabase
          .from("group_members")
          .delete()
          .eq("group_id", groupId)
          .eq("user_id", user.id);

        if (error) throw error;

        toast({
          title: "Ai părăsit grupul",
          description: "Nu mai ești membru al acestui grup.",
        });

        // Refresh groups
        fetchGroups();
        fetchMyGroups();

        return true;
      } catch (error: any) {
        console.error("Error leaving group:", error);
        toast({
          title: "Eroare",
          description: "Nu am putut să te scoatem din grup.",
          variant: "destructive",
        });
        return false;
      }
    },
    [user, toast, fetchGroups, fetchMyGroups]
  );

  // Delete a group (only admin can do this)
  const deleteGroup = useCallback(
    async (groupId: string): Promise<boolean> => {
      if (!user) return false;

      try {
        const { error } = await supabase
          .from("groups")
          .delete()
          .eq("id", groupId);

        if (error) throw error;

        toast({
          title: "Grup șters",
          description: "Grupul a fost șters cu succes.",
        });

        // Refresh groups
        fetchGroups();
        fetchMyGroups();

        return true;
      } catch (error: any) {
        console.error("Error deleting group:", error);
        toast({
          title: "Eroare",
          description: "Nu am putut șterge grupul.",
          variant: "destructive",
        });
        return false;
      }
    },
    [user, toast, fetchGroups, fetchMyGroups]
  );

  // Fetch group members
  const fetchGroupMembers = useCallback(
    async (groupId: string): Promise<GroupMember[]> => {
      if (!user) return [];

      try {
        const { data, error } = await supabase
          .from("group_members")
          .select("*")
          .eq("group_id", groupId)
          .order("joined_at", { ascending: true });

        if (error) throw error;

        // Fetch profiles for each member
        const enrichedMembers = await Promise.all(
          (data || []).map(async (member) => {
            const { data: profile } = await supabase
              .from("profiles")
              .select("id, full_name, avatar_url, faculty")
              .eq("user_id", member.user_id)
              .maybeSingle();

            return {
              ...member,
              profile: profile || undefined,
            };
          })
        );

        return enrichedMembers;
      } catch (error: any) {
        console.error("Error fetching group members:", error);
        return [];
      }
    },
    [user]
  );

  // Fetch a single group by ID
  const fetchGroupById = useCallback(
    async (groupId: string): Promise<Group | null> => {
      if (!user) return null;

      try {
        const { data: group, error } = await supabase
          .from("groups")
          .select(`
            *,
            subject:subjects(id, name, faculty),
            university:universities(id, name, short_name)
          `)
          .eq("id", groupId)
          .single();

        if (error) throw error;

        const { count } = await supabase
          .from("group_members")
          .select("*", { count: "exact", head: true })
          .eq("group_id", groupId);

        const { data: membership } = await supabase
          .from("group_members")
          .select("role")
          .eq("group_id", groupId)
          .eq("user_id", user.id)
          .maybeSingle();

        return {
          ...group,
          memberCount: count || 0,
          isCurrentUserMember: !!membership,
          currentUserRole: membership?.role || null,
        };
      } catch (error: any) {
        console.error("Error fetching group:", error);
        return null;
      }
    },
    [user]
  );

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchGroups();
      fetchMyGroups();
    }
  }, [user, fetchGroups, fetchMyGroups]);

  return {
    groups,
    myGroups,
    loading,
    fetchGroups,
    fetchMyGroups,
    createGroup,
    joinGroup,
    leaveGroup,
    deleteGroup,
    fetchGroupMembers,
    fetchGroupById,
  };
}
