import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export type FriendshipStatus = 'pending' | 'accepted' | 'rejected' | 'blocked';

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
  updated_at: string;
}

export interface FriendProfile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  faculty: string;
}

export const useFriendships = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<(Friendship & { profile: FriendProfile })[]>([]);
  const [sentRequests, setSentRequests] = useState<(Friendship & { profile: FriendProfile })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriendships = useCallback(async () => {
    if (!user) {
      setFriends([]);
      setPendingRequests([]);
      setSentRequests([]);
      setLoading(false);
      return;
    }

    try {
      // Get all friendships involving the current user
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select('*')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (error) throw error;

      // Separate by status and role
      const accepted: string[] = [];
      const pending: Friendship[] = [];
      const sent: Friendship[] = [];

      friendships?.forEach((f) => {
        const friendship = f as Friendship;
        if (friendship.status === 'accepted') {
          // Add the other user's ID
          accepted.push(friendship.requester_id === user.id ? friendship.addressee_id : friendship.requester_id);
        } else if (friendship.status === 'pending') {
          if (friendship.addressee_id === user.id) {
            pending.push(friendship);
          } else {
            sent.push(friendship);
          }
        }
      });

      // Fetch profiles for accepted friends
      if (accepted.length > 0) {
        const { data: friendProfiles } = await supabase
          .from('profiles')
          .select('id, user_id, full_name, avatar_url, faculty')
          .in('user_id', accepted);
        
        setFriends(friendProfiles || []);
      } else {
        setFriends([]);
      }

      // Fetch profiles for pending requests (received)
      if (pending.length > 0) {
        const requesterIds = pending.map(p => p.requester_id);
        const { data: requesterProfiles } = await supabase
          .from('profiles')
          .select('id, user_id, full_name, avatar_url, faculty')
          .in('user_id', requesterIds);
        
        const pendingWithProfiles = pending.map(p => ({
          ...p,
          profile: requesterProfiles?.find(pr => pr.user_id === p.requester_id) as FriendProfile
        })).filter(p => p.profile);
        
        setPendingRequests(pendingWithProfiles);
      } else {
        setPendingRequests([]);
      }

      // Fetch profiles for sent requests
      if (sent.length > 0) {
        const addresseeIds = sent.map(s => s.addressee_id);
        const { data: addresseeProfiles } = await supabase
          .from('profiles')
          .select('id, user_id, full_name, avatar_url, faculty')
          .in('user_id', addresseeIds);
        
        const sentWithProfiles = sent.map(s => ({
          ...s,
          profile: addresseeProfiles?.find(pr => pr.user_id === s.addressee_id) as FriendProfile
        })).filter(s => s.profile);
        
        setSentRequests(sentWithProfiles);
      } else {
        setSentRequests([]);
      }
    } catch (error) {
      console.error('Error fetching friendships:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Send friend request
  const sendFriendRequest = async (addresseeUserId: string) => {
    if (!user) {
      toast.error('Trebuie să fii autentificat');
      return false;
    }

    if (user.id === addresseeUserId) {
      toast.error('Nu poți trimite cerere de prietenie ție însuți');
      return false;
    }

    try {
      const { error } = await supabase
        .from('friendships')
        .insert({
          requester_id: user.id,
          addressee_id: addresseeUserId,
          status: 'pending'
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('Cererea de prietenie există deja');
        } else {
          throw error;
        }
        return false;
      }

      toast.success('Cerere de prietenie trimisă!');
      await fetchFriendships();
      return true;
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Eroare la trimiterea cererii');
      return false;
    }
  };

  // Accept friend request
  const acceptFriendRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', friendshipId);

      if (error) throw error;

      toast.success('Cerere acceptată!');
      await fetchFriendships();
      return true;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error('Eroare la acceptarea cererii');
      return false;
    }
  };

  // Reject friend request
  const rejectFriendRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'rejected' })
        .eq('id', friendshipId);

      if (error) throw error;

      toast.success('Cerere respinsă');
      await fetchFriendships();
      return true;
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      toast.error('Eroare la respingerea cererii');
      return false;
    }
  };

  // Remove friend
  const removeFriend = async (friendUserId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .or(`and(requester_id.eq.${user.id},addressee_id.eq.${friendUserId}),and(requester_id.eq.${friendUserId},addressee_id.eq.${user.id})`);

      if (error) throw error;

      toast.success('Prieten eliminat');
      await fetchFriendships();
      return true;
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('Eroare la eliminarea prietenului');
      return false;
    }
  };

  // Cancel sent request
  const cancelFriendRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;

      toast.success('Cerere anulată');
      await fetchFriendships();
      return true;
    } catch (error) {
      console.error('Error canceling friend request:', error);
      toast.error('Eroare la anularea cererii');
      return false;
    }
  };

  // Check friendship status with a specific user
  const getFriendshipStatus = (targetUserId: string): 'none' | 'pending_sent' | 'pending_received' | 'accepted' => {
    if (friends.some(f => f.user_id === targetUserId)) {
      return 'accepted';
    }
    if (sentRequests.some(s => s.addressee_id === targetUserId)) {
      return 'pending_sent';
    }
    if (pendingRequests.some(p => p.requester_id === targetUserId)) {
      return 'pending_received';
    }
    return 'none';
  };

  useEffect(() => {
    fetchFriendships();
  }, [fetchFriendships]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('friendships-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
        },
        () => {
          fetchFriendships();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchFriendships]);

  return {
    friends,
    pendingRequests,
    sentRequests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    cancelFriendRequest,
    getFriendshipStatus,
    refresh: fetchFriendships,
  };
};
