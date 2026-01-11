import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { Send, ArrowLeft } from "lucide-react";
import { Message, Conversation } from "@/hooks/useMessages";
import { useMessageReactions } from "@/hooks/useMessageReactions";
import { EmojiPicker } from "@/components/EmojiPicker";
import { GifPicker } from "@/components/GifPicker";
import { MessageReactions } from "@/components/MessageReactions";

interface MessageThreadProps {
  conversation: Conversation | null;
  messages: Message[];
  currentUserId: string;
  onSendMessage: (content: string) => void;
  onBack?: () => void;
  loading?: boolean;
}

export function MessageThread({
  conversation,
  messages,
  currentUserId,
  onSendMessage,
  onBack,
  loading,
}: MessageThreadProps) {
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { 
    fetchReactions, 
    addReaction, 
    removeReaction, 
    getReactionsForMessage 
  } = useMessageReactions(conversation?.id || null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input on conversation change
  useEffect(() => {
    inputRef.current?.focus();
  }, [conversation?.id]);

  // Fetch reactions when messages change
  useEffect(() => {
    if (messages.length > 0) {
      fetchReactions(messages.map(m => m.id));
    }
  }, [messages, fetchReactions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage("");
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const handleGifSelect = (gifUrl: string) => {
    onSendMessage(gifUrl);
  };

  const handleReact = (messageId: string, emoji: string) => {
    addReaction(messageId, emoji);
  };

  const handleRemoveReaction = (messageId: string, emoji: string) => {
    removeReaction(messageId, emoji);
  };

  // Check if content is a GIF URL
  const isGifUrl = (content: string) => {
    return content.includes("tenor.com") || 
           content.includes(".gif") || 
           content.includes("giphy.com");
  };

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
          <span className="text-3xl">💬</span>
        </div>
        <h3 className="font-semibold text-xl mb-2">Mesaje</h3>
        <p className="text-muted-foreground">
          Selectează o conversație pentru a vedea mesajele
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-card/50">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <Avatar className="h-10 w-10">
          <AvatarImage src={conversation.otherParticipant?.avatar_url || ""} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {conversation.otherParticipant?.full_name?.charAt(0) || "?"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">
            {conversation.otherParticipant?.full_name || "Utilizator"}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {conversation.otherParticipant?.faculty}
          </p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-muted-foreground">Se încarcă...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground">
              Începe conversația cu {conversation.otherParticipant?.full_name}!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isOwn = message.sender_id === currentUserId;
              const showDate =
                index === 0 ||
                format(new Date(message.created_at), "PP") !==
                  format(new Date(messages[index - 1].created_at), "PP");
              const messageReactions = getReactionsForMessage(message.id);
              const isGif = isGifUrl(message.content);

              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                        {format(new Date(message.created_at), "PP", { locale: ro })}
                      </span>
                    </div>
                  )}
                  <div
                    className={cn(
                      "flex gap-2 max-w-[80%] group",
                      isOwn ? "ml-auto flex-row-reverse" : ""
                    )}
                  >
                    {!isOwn && (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={conversation.otherParticipant?.avatar_url || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {conversation.otherParticipant?.full_name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex flex-col">
                      <div
                        className={cn(
                          "rounded-2xl max-w-full overflow-hidden",
                          isGif ? "p-0" : "px-4 py-2",
                          isOwn
                            ? isGif ? "rounded-br-md" : "bg-primary text-primary-foreground rounded-br-md"
                            : isGif ? "rounded-bl-md" : "bg-muted rounded-bl-md"
                        )}
                      >
                        {isGif ? (
                          <img 
                            src={message.content} 
                            alt="GIF" 
                            className="max-w-[240px] rounded-2xl"
                            loading="lazy"
                          />
                        ) : (
                          <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
                        )}
                        {!isGif && (
                          <p
                            className={cn(
                              "text-[10px] mt-1",
                              isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                            )}
                          >
                            {format(new Date(message.created_at), "HH:mm")}
                          </p>
                        )}
                      </div>
                      {isGif && (
                        <p
                          className={cn(
                            "text-[10px] mt-1",
                            isOwn ? "text-right" : "",
                            "text-muted-foreground"
                          )}
                        >
                          {format(new Date(message.created_at), "HH:mm")}
                        </p>
                      )}
                      
                      {/* Reactions */}
                      <MessageReactions
                        reactions={messageReactions}
                        onReact={(emoji) => handleReact(message.id, emoji)}
                        onRemoveReaction={(emoji) => handleRemoveReaction(message.id, emoji)}
                        isOwn={isOwn}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t bg-card/50">
        <div className="flex gap-2 items-center">
          <EmojiPicker onEmojiSelect={handleEmojiSelect} />
          <GifPicker onGifSelect={handleGifSelect} />
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Scrie un mesaj..."
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
