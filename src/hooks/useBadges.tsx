import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  points_required: number;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge: Badge;
}

export const useBadges = (userId?: string) => {
  const { user } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);

  const targetUserId = userId || user?.id;

  const fetchBadges = useCallback(async () => {
    try {
      // Fetch all available badges
      const { data: allBadges } = await supabase
        .from('badges')
        .select('*')
        .order('category', { ascending: true });

      setBadges(allBadges || []);

      // Fetch user's earned badges if we have a target user
      if (targetUserId) {
        const { data: earnedBadges } = await supabase
          .from('user_badges')
          .select('*, badge:badges(*)')
          .eq('user_id', targetUserId);

        // Map the data to match our interface
        const mappedBadges = (earnedBadges || []).map((ub: any) => ({
          id: ub.id,
          user_id: ub.user_id,
          badge_id: ub.badge_id,
          earned_at: ub.earned_at,
          badge: ub.badge as Badge
        }));

        setUserBadges(mappedBadges);
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  }, [targetUserId]);

  // Check and award badges for current user
  const checkAndAwardBadges = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Call the edge function to check verified badge and other automatic badges
      await supabase.functions.invoke('check-verified-badge');
      
      // Also call the database function for other criteria
      await supabase.rpc('check_and_award_badges', { p_user_id: user.id });
      await fetchBadges();
    } catch (error) {
      console.error('Error checking badges:', error);
    }
  }, [user?.id, fetchBadges]);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  // Trigger badge check when user is logged in
  useEffect(() => {
    if (user?.id) {
      checkAndAwardBadges();
    }
  }, [user?.id, checkAndAwardBadges]);

  return {
    badges,
    userBadges,
    loading,
    checkAndAwardBadges,
    refresh: fetchBadges,
  };
};
