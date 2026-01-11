import { useEffect, useCallback, useState, createContext, useContext, ReactNode, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

interface NotificationContextType {
  unreadCount: number;
  friendRequestCount: number;
  refreshUnreadCount: () => Promise<void>;
  refreshFriendRequestCount: () => Promise<void>;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Create a simple notification sound using Web Audio API
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create a pleasant two-tone notification sound
    const playTone = (frequency: number, startTime: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = "sine";
      
      // Envelope for smooth sound
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };
    
    const now = audioContext.currentTime;
    playTone(880, now, 0.15); // A5
    playTone(1108.73, now + 0.1, 0.2); // C#6
    
  } catch (error) {
    console.log("Could not play notification sound:", error);
  }
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [unreadCount, setUnreadCount] = useState(0);
  const [friendRequestCount, setFriendRequestCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem("notificationSoundEnabled");
    return saved !== null ? saved === "true" : true;
  });
  const hasInteracted = useRef(false);

  // Track user interaction for audio autoplay policy
  useEffect(() => {
    const handleInteraction = () => {
      hasInteracted.current = true;
    };
    
    window.addEventListener("click", handleInteraction, { once: true });
    window.addEventListener("keydown", handleInteraction, { once: true });
    
    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, []);

  // Save sound preference
  useEffect(() => {
    localStorage.setItem("notificationSoundEnabled", String(soundEnabled));
  }, [soundEnabled]);

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

  // Fetch friend request count
  const refreshFriendRequestCount = useCallback(async () => {
    if (!user) {
      setFriendRequestCount(0);
      return;
    }

    try {
      const { count } = await supabase
        .from("friendships")
        .select("*", { count: "exact", head: true })
        .eq("addressee_id", user.id)
        .eq("status", "pending");

      setFriendRequestCount(count || 0);
    } catch (error) {
      console.error("Error fetching friend request count:", error);
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

          // Play notification sound if enabled and user has interacted
          if (soundEnabled && hasInteracted.current) {
            playNotificationSound();
          }

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
  }, [user, toast, refreshUnreadCount, soundEnabled]);

  // Listen for new friend requests
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("friend-requests")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "friendships",
        },
        async (payload) => {
          const newRequest = payload.new as {
            id: string;
            requester_id: string;
            addressee_id: string;
            status: string;
          };

          // Only notify if request is for current user
          if (newRequest.addressee_id !== user.id) return;

          // Get requester's profile
          const { data: requesterProfile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", newRequest.requester_id)
            .single();

          const requesterName = requesterProfile?.full_name || "Cineva";

          // Play notification sound if enabled
          if (soundEnabled && hasInteracted.current) {
            playNotificationSound();
          }

          // Show toast notification
          toast({
            title: "👋 Cerere de prietenie",
            description: `${requesterName} vrea să fie prieten cu tine!`,
          });

          // Refresh friend request count
          refreshFriendRequestCount();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "friendships",
        },
        () => {
          refreshFriendRequestCount();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "friendships",
        },
        () => {
          refreshFriendRequestCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast, refreshFriendRequestCount, soundEnabled]);

  // Fetch initial counts
  useEffect(() => {
    refreshUnreadCount();
    refreshFriendRequestCount();
  }, [refreshUnreadCount, refreshFriendRequestCount]);

  return (
    <NotificationContext.Provider value={{ 
      unreadCount, 
      friendRequestCount,
      refreshUnreadCount, 
      refreshFriendRequestCount,
      soundEnabled, 
      setSoundEnabled 
    }}>
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
