import { useState, useMemo, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OnlineStatusIndicator } from "@/components/OnlineStatusIndicator";
import { OnlineStatusControl } from "@/components/OnlineStatusControl";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";
import { Search } from "lucide-react";
import { Conversation } from "@/hooks/useMessages";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

export function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  
  const { 
    myStatus, 
    updateMyStatus, 
    loading: statusLoading,
    fetchPresenceForUsers,
    isUserOnline 
  } = useOnlineStatus();

  // Fetch presence for all conversation participants
  useEffect(() => {
    const userIds = conversations
      .map(c => c.otherParticipant?.user_id)
      .filter((id): id is string => !!id);
    
    if (userIds.length > 0) {
      fetchPresenceForUsers(userIds);
    }
  }, [conversations, fetchPresenceForUsers]);

  // Filter conversations based on search and tab
  const filteredConversations = useMemo(() => {
    let filtered = conversations;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((convo) =>
        convo.otherParticipant?.full_name?.toLowerCase().includes(query)
      );
    }

    // Filter by unread
    if (activeTab === "unread") {
      filtered = filtered.filter((convo) => (convo.unreadCount || 0) > 0);
    }

    return filtered;
  }, [conversations, searchQuery, activeTab]);

  const unreadCount = useMemo(() => 
    conversations.filter(c => (c.unreadCount || 0) > 0).length,
    [conversations]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header with online status control */}
      <div className="p-3 border-b space-y-3">
        <OnlineStatusControl
          status={myStatus}
          onStatusChange={updateMyStatus}
          loading={statusLoading}
        />
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Caută conversații..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filter Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | "unread")}>
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">
              Toate
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex-1 gap-1.5">
              Necitite
              {unreadCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Conversations List */}
      {filteredConversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <span className="text-2xl">💬</span>
          </div>
          <h3 className="font-semibold text-lg mb-2">
            {searchQuery 
              ? "Niciun rezultat" 
              : activeTab === "unread" 
                ? "Niciun mesaj necitit" 
                : "Nicio conversație"}
          </h3>
          <p className="text-muted-foreground text-sm">
            {searchQuery
              ? "Încearcă alt termen de căutare"
              : activeTab === "unread"
                ? "Toate mesajele au fost citite!"
                : "Conectează-te cu alți studenți pentru a începe să conversezi!"}
          </p>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {filteredConversations.map((convo) => {
              const otherUserId = convo.otherParticipant?.user_id;
              const isOnline = otherUserId ? isUserOnline(otherUserId) : false;

              return (
                <button
                  key={convo.id}
                  onClick={() => onSelectConversation(convo.id)}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left",
                    activeConversationId === convo.id
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={convo.otherParticipant?.avatar_url || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {convo.otherParticipant?.full_name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <OnlineStatusIndicator 
                      isOnline={isOnline} 
                      size="md"
                      className="bottom-0 right-0"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium truncate">
                        {convo.otherParticipant?.full_name || "Utilizator"}
                      </span>
                      {convo.unreadCount && convo.unreadCount > 0 && (
                        <Badge variant="default" className="flex-shrink-0 h-5 w-5 p-0 flex items-center justify-center text-xs">
                          {convo.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {convo.otherParticipant?.faculty}
                    </p>
                    {convo.lastMessage && (
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {convo.lastMessage.content}
                      </p>
                    )}
                    {convo.lastMessage && (
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        {formatDistanceToNow(new Date(convo.lastMessage.created_at), {
                          addSuffix: true,
                          locale: ro,
                        })}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
