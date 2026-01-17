import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

interface BlockedUser {
  id: string;
  blocked_id: string;
  created_at: string;
}

export function useBlockedUsers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch blocked users
  const fetchBlockedUsers = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("blocked_users")
        .select("*")
        .eq("blocker_id", user.id);

      if (error) throw error;
      setBlockedUsers(data || []);
    } catch (error) {
      console.error("Error fetching blocked users:", error);
    }
  }, [user]);

  // Block a user
  const blockUser = useCallback(async (userId: string) => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("blocked_users")
        .insert({
          blocker_id: user.id,
          blocked_id: userId,
        });

      if (error) throw error;

      toast({
        title: "Utilizator blocat",
        description: "Nu vei mai primi mesaje de la acest utilizator.",
      });

      await fetchBlockedUsers();
      return true;
    } catch (error: any) {
      console.error("Error blocking user:", error);
      toast({
        title: "Eroare",
        description: "Nu am putut bloca utilizatorul.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast, fetchBlockedUsers]);

  // Unblock a user
  const unblockUser = useCallback(async (userId: string) => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("blocked_users")
        .delete()
        .eq("blocker_id", user.id)
        .eq("blocked_id", userId);

      if (error) throw error;

      toast({
        title: "Utilizator deblocat",
        description: "Poți primi din nou mesaje de la acest utilizator.",
      });

      await fetchBlockedUsers();
      return true;
    } catch (error: any) {
      console.error("Error unblocking user:", error);
      toast({
        title: "Eroare",
        description: "Nu am putut debloca utilizatorul.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast, fetchBlockedUsers]);

  // Check if a user is blocked
  const isUserBlocked = useCallback((userId: string): boolean => {
    return blockedUsers.some((b) => b.blocked_id === userId);
  }, [blockedUsers]);

  // Fetch on mount
  useEffect(() => {
    fetchBlockedUsers();
  }, [fetchBlockedUsers]);

  return {
    blockedUsers,
    loading,
    blockUser,
    unblockUser,
    isUserBlocked,
    fetchBlockedUsers,
  };
}
