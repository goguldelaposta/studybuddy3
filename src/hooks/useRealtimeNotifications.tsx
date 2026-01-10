import { useEffect, useCallback, useState, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

interface NotificationContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch total unread message count
  const refreshUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    try {
      // Get all conversations for the user
      const { data: convos } = await supabase
        .from("conversations")
        .select("id")
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`);

      if (!convos || convos.length === 0) {
        setUnreadCount(0);
        return;
      }

      const convoIds = convos.map((c) => c.id);

      // Count unread messages across all conversations
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .in("conversation_id", convoIds)
        .neq("sender_id", user.id)
        .is("read_at", null);

      setUnreadCount(count || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, [user]);

  // Listen for new messages globally
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("global-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          const newMessage = payload.new as {
            id: string;
            conversation_id: string;
            sender_id: string;
            content: string;
          };

          // Only notify if the message is for the current user (not sent by them)
          if (newMessage.sender_id === user.id) return;

          // Check if this message belongs to a conversation the user is part of
          const { data: convo } = await supabase
            .from("conversations")
            .select("participant_1, participant_2")
            .eq("id", newMessage.conversation_id)
            .single();

          if (!convo) return;

          const isParticipant =
            convo.participant_1 === user.id || convo.participant_2 === user.id;

          if (!isParticipant) return;

          // Get sender's profile for the notification
          const senderId = newMessage.sender_id;
          const { data: senderProfile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", senderId)
            .single();

          const senderName = senderProfile?.full_name || "Cineva";

          // Show toast notification
          toast({
            title: "📩 Mesaj nou",
            description: `${senderName}: ${newMessage.content.substring(0, 50)}${newMessage.content.length > 50 ? "..." : ""}`,
          });

          // Refresh unread count
          refreshUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast, refreshUnreadCount]);

  // Fetch initial unread count
  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useRealtimeNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useRealtimeNotifications must be used within a NotificationProvider");
  }
  return context;
}
