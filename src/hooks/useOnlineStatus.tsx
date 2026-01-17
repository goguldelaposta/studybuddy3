import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type OnlineStatusType = "online" | "offline";

interface UserPresence {
  [userId: string]: {
    isOnline: boolean;
    lastSeen: string;
  };
}

export function useOnlineStatus() {
  const { user } = useAuth();
  const [myStatus, setMyStatus] = useState<OnlineStatusType>("online");
  const [userPresence, setUserPresence] = useState<UserPresence>({});
  const [loading, setLoading] = useState(false);

  // Fetch current user's online status preference
  const fetchMyStatus = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("online_status")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      if (data?.online_status) {
        setMyStatus(data.online_status as OnlineStatusType);
      }
    } catch (error) {
      console.error("Error fetching online status:", error);
    }
  }, [user]);

  // Update online status preference
  const updateMyStatus = useCallback(async (status: OnlineStatusType) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ 
          online_status: status,
          last_seen: new Date().toISOString()
        })
        .eq("user_id", user.id);

      if (error) throw error;
      setMyStatus(status);
    } catch (error) {
      console.error("Error updating online status:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Update last_seen timestamp periodically
  const updateLastSeen = useCallback(async () => {
    if (!user) return;

    try {
      await supabase
        .from("profiles")
        .update({ last_seen: new Date().toISOString() })
        .eq("user_id", user.id);
    } catch (error) {
      console.error("Error updating last seen:", error);
    }
  }, [user]);

  // Fetch presence for specific user IDs
  const fetchPresenceForUsers = useCallback(async (userIds: string[]) => {
    if (userIds.length === 0) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, online_status, last_seen")
        .in("user_id", userIds);

      if (error) throw error;

      const presenceMap: UserPresence = {};
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      data?.forEach((profile) => {
        const lastSeen = profile.last_seen ? new Date(profile.last_seen) : null;
        const isRecentlyActive = lastSeen && lastSeen > fiveMinutesAgo;
        
        presenceMap[profile.user_id] = {
          isOnline: profile.online_status === "online" && !!isRecentlyActive,
          lastSeen: profile.last_seen || "",
        };
      });

      setUserPresence(prev => ({ ...prev, ...presenceMap }));
    } catch (error) {
      console.error("Error fetching user presence:", error);
    }
  }, []);

  // Check if a specific user is online
  const isUserOnline = useCallback((userId: string): boolean => {
    return userPresence[userId]?.isOnline || false;
  }, [userPresence]);

  // Update last_seen periodically when user is active
  useEffect(() => {
    if (!user || myStatus === "offline") return;

    // Update immediately
    updateLastSeen();

    // Update every 2 minutes
    const interval = setInterval(updateLastSeen, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, myStatus, updateLastSeen]);

  // Fetch status on mount
  useEffect(() => {
    fetchMyStatus();
  }, [fetchMyStatus]);

  return {
    myStatus,
    loading,
    updateMyStatus,
    fetchPresenceForUsers,
    isUserOnline,
    userPresence,
  };
}
