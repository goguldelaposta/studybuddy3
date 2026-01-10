import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  created_at: string;
  updated_at: string;
  otherParticipant?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    faculty: string;
  };
  lastMessage?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  unreadCount?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
}

export function useMessages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Fetch all conversations for the current user
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: convos, error } = await supabase
        .from("conversations")
        .select("*")
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // Fetch participant profiles and last messages
      const enrichedConvos = await Promise.all(
        (convos || []).map(async (convo) => {
          const otherParticipantId = convo.participant_1 === user.id 
            ? convo.participant_2 
            : convo.participant_1;

          // Get other participant's profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url, faculty")
            .eq("user_id", otherParticipantId)
            .single();

          // Get last message
          const { data: lastMsg } = await supabase
            .from("messages")
            .select("content, created_at, sender_id")
            .eq("conversation_id", convo.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          // Get unread count
          const { count } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", convo.id)
            .neq("sender_id", user.id)
            .is("read_at", null);

          return {
            ...convo,
            otherParticipant: profile || undefined,
            lastMessage: lastMsg || undefined,
            unreadCount: count || 0,
          };
        })
      );

      setConversations(enrichedConvos);
    } catch (error: any) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch messages for a specific conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      setActiveConversationId(conversationId);

      // Mark messages as read
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .neq("sender_id", user.id)
        .is("read_at", null);

    } catch (error: any) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Send a message
  const sendMessage = useCallback(async (conversationId: string, content: string) => {
    if (!user || !content.trim()) return;

    try {
      const { error } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
        });

      if (error) throw error;
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Eroare",
        description: "Nu am putut trimite mesajul. Încearcă din nou.",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  // Start a new conversation or get existing one
  const startConversation = useCallback(async (otherUserId: string): Promise<string | null> => {
    if (!user) return null;

    try {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .or(`and(participant_1.eq.${user.id},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${user.id})`)
        .single();

      if (existing) {
        return existing.id;
      }

      // Create new conversation
      const { data: newConvo, error } = await supabase
        .from("conversations")
        .insert({
          participant_1: user.id,
          participant_2: otherUserId,
        })
        .select("id")
        .single();

      if (error) throw error;
      
      toast({
        title: "Conversație nouă",
        description: "Poți acum să trimiți mesaje!",
      });

      return newConvo?.id || null;
    } catch (error: any) {
      console.error("Error starting conversation:", error);
      toast({
        title: "Eroare",
        description: "Nu am putut crea conversația.",
        variant: "destructive",
      });
      return null;
    }
  }, [user, toast]);

  // Set up realtime subscription for messages
  useEffect(() => {
    if (!activeConversationId) return;

    const channel = supabase
      .channel(`messages-${activeConversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);
          
          // Mark as read if from other user
          if (user && newMessage.sender_id !== user.id) {
            supabase
              .from("messages")
              .update({ read_at: new Date().toISOString() })
              .eq("id", newMessage.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversationId, user]);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    messages,
    loading,
    activeConversationId,
    fetchConversations,
    fetchMessages,
    sendMessage,
    startConversation,
    setActiveConversationId,
  };
}
