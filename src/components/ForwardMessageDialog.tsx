import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Forward } from "lucide-react";
import { Conversation, Message } from "@/hooks/useMessages";
import { cn } from "@/lib/utils";

interface ForwardMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message: Message | null;
  conversations: Conversation[];
  onForward: (conversationId: string, messageContent: string) => void;
}

export function ForwardMessageDialog({
  isOpen,
  onClose,
  message,
  conversations,
  onForward,
}: ForwardMessageDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  const filteredConversations = conversations.filter((convo) =>
    convo.otherParticipant?.full_name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handleForward = () => {
    if (selectedConversation && message) {
      onForward(selectedConversation, `[Trimis mai departe]\n\n${message.content}`);
      setSelectedConversation(null);
      setSearchQuery("");
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedConversation(null);
    setSearchQuery("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Forward className="h-5 w-5" />
            Trimite mesajul mai departe
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Caută conversații..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Message preview */}
          {message && (
            <div className="p-3 bg-muted/50 rounded-lg border-l-2 border-primary">
              <p className="text-xs text-muted-foreground mb-1">Mesaj de trimis:</p>
              <p className="text-sm truncate">{message.content.substring(0, 100)}{message.content.length > 100 ? '...' : ''}</p>
            </div>
          )}

          {/* Conversations list */}
          <ScrollArea className="h-[300px]">
            <div className="space-y-1">
              {filteredConversations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nu s-au găsit conversații
                </p>
              ) : (
                filteredConversations.map((convo) => (
                  <button
                    key={convo.id}
                    onClick={() => setSelectedConversation(convo.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg transition-colors",
                      selectedConversation === convo.id
                        ? "bg-primary/10 border border-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={convo.otherParticipant?.avatar_url || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {convo.otherParticipant?.full_name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-medium truncate">
                        {convo.otherParticipant?.full_name || "Utilizator"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {convo.otherParticipant?.faculty}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleClose}>
              Anulează
            </Button>
            <Button 
              onClick={handleForward} 
              disabled={!selectedConversation}
            >
              <Forward className="h-4 w-4 mr-2" />
              Trimite
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}