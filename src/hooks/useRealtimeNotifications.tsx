import { useEffect, useCallback, useState, createContext, useContext, ReactNode, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

interface NotificationContextType {
  unreadCount: number;
  friendRequestCount: number;
  newBadgeCount: number;
  refreshUnreadCount: () => Promise<void>;
  refreshFriendRequestCount: () => Promise<void>;
  refreshNewBadgeCount: () => Promise<void>;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  desktopNotificationsEnabled: boolean;
  requestDesktopPermission: () => Promise<void>;
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

// Send desktop notification
const sendDesktopNotification = (title: string, body: string, icon?: string) => {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  if (document.hasFocus()) return; // Don't show if tab is active

  try {
    const notification = new Notification(title, {
      body,
      icon: icon || "/favicon.png",
      tag: "studybuddy-message",
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto-close after 5 seconds
    setTimeout(() => notification.close(), 5000);
  } catch (error) {
    console.log("Could not send desktop notification:", error);
  }
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [unreadCount, setUnreadCount] = useState(0);
  const [friendRequestCount, setFriendRequestCount] = useState(0);
  const [newBadgeCount, setNewBadgeCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem("notificationSoundEnabled");
    return saved !== null ? saved === "true" : true;
  });
  const [desktopNotificationsEnabled, setDesktopNotificationsEnabled] = useState(() => {
    if (!("Notification" in window)) return false;
    return Notification.permission === "granted";
  });
  const hasInteracted = useRef(false);
  const seenBadgesRef = useRef<Set<string>>(new Set());

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

  // Request desktop notification permission
  const requestDesktopPermission = useCallback(async () => {
    // Check if Notifications API is supported
    if (!("Notification" in window)) {
      toast({
        title: "Notificări indisponibile",
        description: "Browserul tău nu suportă notificări desktop.",
        variant: "destructive",
      });
      return;
    }

    // Check current permission state first
    const currentPermission = Notification.permission;

    // If already denied, show instructions
    if (currentPermission === "denied") {
      toast({
        title: "Notificări blocate",
        description: "Te rog activează notificările din setările browserului (click pe iconița 🔒 lângă URL).",
        variant: "destructive",
      });
      return;
    }

    // If already granted, send test notification
    if (currentPermission === "granted") {
      setDesktopNotificationsEnabled(true);
      sendTestNotification();
      toast({
        title: "Notificări deja active!",
        description: "Am trimis o notificare de test.",
      });
      return;
    }

    // Permission is "default" - need to request
    try {
      const permission = await Notification.requestPermission();
      
      setDesktopNotificationsEnabled(permission === "granted");
      
      if (permission === "granted") {
        // Send test notification immediately
        sendTestNotification();
        toast({
          title: "Notificări activate! 🎉",
          description: "Vei primi notificări desktop pentru mesaje noi.",
        });
      } else if (permission === "denied") {
        toast({
          title: "Notificări blocate",
          description: "Te rog activează notificările din setările browserului (click pe iconița 🔒 lângă URL).",
          variant: "destructive",
        });
      } else {
        // "default" - user dismissed the prompt
        toast({
          title: "Permisiune necesară",
          description: "Apasă din nou pentru a activa notificările.",
        });
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      toast({
        title: "Eroare",
        description: "Nu am putut solicita permisiunea pentru notificări.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Send a test notification
  const sendTestNotification = () => {
    try {
      const notification = new Notification("✅ Notificările funcționează!", {
        body: "Vei primi notificări când primești mesaje noi.",
        icon: "/favicon.png",
        tag: "studybuddy-test",
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    } catch (error) {
      console.error("Error sending test notification:", error);
    }
  };

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

  // Fetch new badge count (badges earned in last 24h that haven't been seen)
  const refreshNewBadgeCount = useCallback(async () => {
    if (!user) {
      setNewBadgeCount(0);
      return;
    }

    try {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const { data, count } = await supabase
        .from("user_badges")
        .select("id", { count: "exact" })
        .eq("user_id", user.id)
        .gte("earned_at", oneDayAgo.toISOString());

      // Update seen badges
      if (data) {
        data.forEach((b: any) => seenBadgesRef.current.add(b.id));
      }

      // We'll show new badge count as 0 after initial load since we show toast instead
      setNewBadgeCount(0);
    } catch (error) {
      console.error("Error fetching new badge count:", error);
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
          const messagePreview = newMessage.content.substring(0, 50) + (newMessage.content.length > 50 ? "..." : "");

          // Play notification sound if enabled and user has interacted
          if (soundEnabled && hasInteracted.current) {
            playNotificationSound();
          }

          // Send desktop notification when tab is not active
          sendDesktopNotification(
            `📩 Mesaj nou de la ${senderName}`,
            messagePreview
          );

          // Show toast notification
          toast({
            title: "📩 Mesaj nou",
            description: `${senderName}: ${messagePreview}`,
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

  // Listen for new badges
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("user-badges")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "user_badges",
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          const newBadge = payload.new as {
            id: string;
            badge_id: string;
            user_id: string;
          };

          // Skip if we've already seen this badge
          if (seenBadgesRef.current.has(newBadge.id)) return;
          seenBadgesRef.current.add(newBadge.id);

          // Get badge details
          const { data: badgeData } = await supabase
            .from("badges")
            .select("name, description, icon, color")
            .eq("id", newBadge.badge_id)
            .single();

          if (!badgeData) return;

          // Play notification sound if enabled
          if (soundEnabled && hasInteracted.current) {
            playNotificationSound();
          }

          // Show toast notification
          toast({
            title: "🏆 Insignă nouă câștigată!",
            description: `Ai primit insigna "${badgeData.name}"!`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast, soundEnabled]);

  // Fetch initial counts
  useEffect(() => {
    refreshUnreadCount();
    refreshFriendRequestCount();
    refreshNewBadgeCount();
  }, [refreshUnreadCount, refreshFriendRequestCount, refreshNewBadgeCount]);

  return (
    <NotificationContext.Provider value={{ 
      unreadCount, 
      friendRequestCount,
      newBadgeCount,
      refreshUnreadCount, 
      refreshFriendRequestCount,
      refreshNewBadgeCount,
      soundEnabled, 
      setSoundEnabled,
      desktopNotificationsEnabled,
      requestDesktopPermission,
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
