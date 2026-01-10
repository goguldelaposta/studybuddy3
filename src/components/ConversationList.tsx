import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";
import { Conversation } from "@/hooks/useMessages";

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
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <span className="text-2xl">💬</span>
        </div>
        <h3 className="font-semibold text-lg mb-2">Nicio conversație</h3>
        <p className="text-muted-foreground text-sm">
          Conectează-te cu alți studenți pentru a începe să conversezi!
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2">
        {conversations.map((convo) => (
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
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage src={convo.otherParticipant?.avatar_url || ""} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {convo.otherParticipant?.full_name?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
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
        ))}
      </div>
    </ScrollArea>
  );
}
