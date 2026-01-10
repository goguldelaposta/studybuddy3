import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { ConversationList } from "@/components/ConversationList";
import { MessageThread } from "@/components/MessageThread";
import { useAuth } from "@/hooks/useAuth";
import { useMessages } from "@/hooks/useMessages";
import { useProfiles } from "@/hooks/useProfiles";
import { cn } from "@/lib/utils";

const Messages = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signOut, loading: authLoading } = useAuth();
  const { currentUserProfile } = useProfiles();
  const {
    conversations,
    messages,
    loading,
    activeConversationId,
    fetchConversations,
    fetchMessages,
    sendMessage,
    startConversation,
    setActiveConversationId,
  } = useMessages();

  const [showMobileThread, setShowMobileThread] = useState(false);

  // Handle redirect for unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?mode=signin");
    }
  }, [user, authLoading, navigate]);

  // Handle starting a conversation with a specific user from URL param
  useEffect(() => {
    const startWithUserId = searchParams.get("with");
    if (startWithUserId && user) {
      startConversation(startWithUserId).then((conversationId) => {
        if (conversationId) {
          fetchMessages(conversationId);
          setShowMobileThread(true);
          fetchConversations();
        }
      });
    }
  }, [searchParams, user, startConversation, fetchMessages, fetchConversations]);

  const handleSelectConversation = (conversationId: string) => {
    fetchMessages(conversationId);
    setShowMobileThread(true);
  };

  const handleSendMessage = (content: string) => {
    if (activeConversationId) {
      sendMessage(activeConversationId, content);
    }
  };

  const handleBack = () => {
    setActiveConversationId(null);
    setShowMobileThread(false);
  };

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Se încarcă...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar
        isAuthenticated={!!user}
        user={user ? { email: user.email || "", fullName: currentUserProfile?.full_name } : null}
        onSignOut={signOut}
      />

      <div className="flex-1 container py-6 flex flex-col">
        <h1 className="font-display text-2xl md:text-3xl font-bold mb-6">
          <span className="gradient-text">Mesaje</span>
        </h1>

        <div className="flex-1 grid md:grid-cols-[320px_1fr] gap-4 min-h-0">
          {/* Conversation List */}
          <div
            className={cn(
              "border rounded-xl bg-card overflow-hidden",
              showMobileThread ? "hidden md:block" : "block"
            )}
          >
            <ConversationList
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={handleSelectConversation}
            />
          </div>

          {/* Message Thread */}
          <div
            className={cn(
              "border rounded-xl bg-card overflow-hidden min-h-[500px]",
              !showMobileThread ? "hidden md:block" : "block"
            )}
          >
            <MessageThread
              conversation={activeConversation}
              messages={messages}
              currentUserId={user.id}
              onSendMessage={handleSendMessage}
              onBack={handleBack}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
