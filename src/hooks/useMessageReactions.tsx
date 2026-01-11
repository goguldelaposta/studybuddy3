import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface ReactionRecord {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

interface AggregatedReaction {
  emoji: string;
  count: number;
  hasReacted: boolean;
}

export function useMessageReactions(conversationId: string | null) {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<Record<string, ReactionRecord[]>>({});
  const [loading, setLoading] = useState(false);

  // Fetch all reactions for messages in a conversation
  const fetchReactions = useCallback(async (messageIds: string[]) => {
    if (!messageIds.length) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("message_reactions")
        .select("*")
        .in("message_id", messageIds);

      if (error) throw error;

      // Group by message_id
      const grouped: Record<string, ReactionRecord[]> = {};
      (data || []).forEach((reaction: ReactionRecord) => {
        if (!grouped[reaction.message_id]) {
          grouped[reaction.message_id] = [];
        }
        grouped[reaction.message_id].push(reaction);
      });

      setReactions(grouped);
    } catch (error) {
      console.error("Error fetching reactions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a reaction
  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("message_reactions")
        .insert({
          message_id: messageId,
          user_id: user.id,
          emoji,
        });

      if (error) throw error;
    } catch (error: any) {
      // Ignore duplicate key errors (user already reacted with this emoji)
      if (!error.message?.includes("duplicate")) {
        console.error("Error adding reaction:", error);
      }
    }
  }, [user]);

  // Remove a reaction
  const removeReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("message_reactions")
        .delete()
        .eq("message_id", messageId)
        .eq("user_id", user.id)
        .eq("emoji", emoji);

      if (error) throw error;
    } catch (error) {
      console.error("Error removing reaction:", error);
    }
  }, [user]);

  // Get aggregated reactions for a message
  const getReactionsForMessage = useCallback((messageId: string): AggregatedReaction[] => {
    const messageReactions = reactions[messageId] || [];
    const emojiMap = new Map<string, { count: number; hasReacted: boolean }>();

    messageReactions.forEach((reaction) => {
      const existing = emojiMap.get(reaction.emoji) || { count: 0, hasReacted: false };
      existing.count++;
      if (reaction.user_id === user?.id) {
        existing.hasReacted = true;
      }
      emojiMap.set(reaction.emoji, existing);
    });

    return Array.from(emojiMap.entries()).map(([emoji, data]) => ({
      emoji,
      count: data.count,
      hasReacted: data.hasReacted,
    }));
  }, [reactions, user?.id]);

  // Set up realtime subscription
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`reactions-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "message_reactions",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newReaction = payload.new as ReactionRecord;
            setReactions((prev) => ({
              ...prev,
              [newReaction.message_id]: [
                ...(prev[newReaction.message_id] || []),
                newReaction,
              ],
            }));
          } else if (payload.eventType === "DELETE") {
            const oldReaction = payload.old as ReactionRecord;
            setReactions((prev) => ({
              ...prev,
              [oldReaction.message_id]: (prev[oldReaction.message_id] || []).filter(
                (r) => r.id !== oldReaction.id
              ),
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  return {
    reactions,
    loading,
    fetchReactions,
    addReaction,
    removeReaction,
    getReactionsForMessage,
  };
}
