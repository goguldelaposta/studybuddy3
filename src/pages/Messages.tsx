import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { ConversationList } from "@/components/ConversationList";
import { MessageThread } from "@/components/MessageThread";
import { NotificationSettings } from "@/components/NotificationSettings";
import { MessageSearch } from "@/components/MessageSearch";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useMessages } from "@/hooks/useMessages";
import { useProfiles } from "@/hooks/useProfiles";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { useBlockedUsers } from "@/hooks/useBlockedUsers";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

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
    isOtherUserTyping,
    fetchConversations,
    fetchMessages,
    sendMessage,
    startConversation,
    setActiveConversationId,
    sendTypingIndicator,
    deleteConversation,
    deleteMessage,
  } = useMessages();
  const { refreshUnreadCount } = useRealtimeNotifications();
  const { isUserBlocked, blockUser, unblockUser } = useBlockedUsers();

  const [showMobileThread, setShowMobileThread] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

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
    setShowSearch(false);
    // Refresh unread count after reading messages
    setTimeout(() => refreshUnreadCount(), 500);
  };

  const handleSearchResultClick = (conversationId: string) => {
    handleSelectConversation(conversationId);
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
  const otherUserId = activeConversation?.otherParticipant?.user_id;
  const isCurrentUserBlocked = otherUserId ? isUserBlocked(otherUserId) : false;

  const handleBlock = useCallback(async () => {
    if (otherUserId) {
      await blockUser(otherUserId);
    }
  }, [otherUserId, blockUser]);

  const handleUnblock = useCallback(async () => {
    if (otherUserId) {
      await unblockUser(otherUserId);
    }
  }, [otherUserId, unblockUser]);

  const handleDeleteConversation = useCallback(async () => {
    if (activeConversationId) {
      await deleteConversation(activeConversationId);
      setShowMobileThread(false);
    }
  }, [activeConversationId, deleteConversation]);

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    await deleteMessage(messageId);
  }, [deleteMessage]);

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
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Navbar
        isAuthenticated={!!user}
        user={user ? { email: user.email || "", fullName: currentUserProfile?.full_name } : null}
        onSignOut={signOut}
      />

      <div className="flex-1 container py-4 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h1 className="font-display text-2xl md:text-3xl font-bold">
            <span className="gradient-text">Mesaje</span>
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSearch(true)}
              title="Caută în mesaje"
            >
              <Search className="h-5 w-5" />
            </Button>
            <NotificationSettings />
          </div>
        </div>

        <div className="flex-1 grid md:grid-cols-[320px_1fr] gap-4 min-h-0 overflow-hidden">
          {/* Conversation List */}
          <div
            className={cn(
              "border rounded-xl bg-card overflow-hidden h-full flex flex-col",
              showMobileThread ? "hidden md:flex" : "flex"
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
              "border rounded-xl bg-card overflow-hidden h-full flex flex-col",
              !showMobileThread ? "hidden md:flex" : "flex"
            )}
          >
            <MessageThread
              conversation={activeConversation}
              messages={messages}
              currentUserId={user.id}
              onSendMessage={handleSendMessage}
              onBack={handleBack}
              loading={loading}
              isOtherUserTyping={isOtherUserTyping}
              onTyping={sendTypingIndicator}
              isBlocked={isCurrentUserBlocked}
              onBlock={handleBlock}
              onUnblock={handleUnblock}
              onDeleteConversation={handleDeleteConversation}
              onDeleteMessage={handleDeleteMessage}
            />
          </div>
        </div>

        {/* Message Search Overlay */}
        <MessageSearch
          isOpen={showSearch}
          onClose={() => setShowSearch(false)}
          onResultClick={handleSearchResultClick}
        />
      </div>
    </div>
  );
};

export default Messages;
