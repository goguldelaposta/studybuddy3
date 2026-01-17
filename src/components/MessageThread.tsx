import { useState, useRef, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { Send, ArrowLeft, Check, CheckCheck, Trash2, Ban } from "lucide-react";
import { Message, Conversation } from "@/hooks/useMessages";
import { useMessageReactions } from "@/hooks/useMessageReactions";
import { EmojiPicker } from "@/components/EmojiPicker";
import { GifPicker } from "@/components/GifPicker";
import { MessageReactions } from "@/components/MessageReactions";
import { ChatActionsMenu } from "@/components/ChatActionsMenu";

interface MessageThreadProps {
  conversation: Conversation | null;
  messages: Message[];
  currentUserId: string;
  onSendMessage: (content: string) => void;
  onBack?: () => void;
  loading?: boolean;
  isOtherUserTyping?: boolean;
  onTyping?: (isTyping: boolean) => void;
  isBlocked?: boolean;
  onBlock?: () => void;
  onUnblock?: () => void;
  onDeleteConversation?: () => void;
  onDeleteMessage?: (messageId: string) => void;
}

export function MessageThread({
  conversation,
  messages,
  currentUserId,
  onSendMessage,
  onBack,
  loading,
  isOtherUserTyping,
  onTyping,
  isBlocked,
  onBlock,
  onUnblock,
  onDeleteConversation,
  onDeleteMessage,
}: MessageThreadProps) {
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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
  }, [messages, isOtherUserTyping]);

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

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!onTyping) return;

    onTyping(true);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 2000);
  }, [onTyping]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage("");
      if (onTyping) onTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    handleTyping();
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    inputRef.current?.focus();
    handleTyping();
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

  // Find the last own message that has been read
  const getLastReadOwnMessageId = () => {
    const ownMessages = messages.filter(m => m.sender_id === currentUserId);
    for (let i = ownMessages.length - 1; i >= 0; i--) {
      if (ownMessages[i].read_at) {
        return ownMessages[i].id;
      }
    }
    return null;
  };

  const lastReadOwnMessageId = getLastReadOwnMessageId();

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
          <span className="text-5xl">👋</span>
        </div>
        <h3 className="font-semibold text-xl mb-3">Începe o conversație nouă</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Selectează o conversație din listă sau conectează-te cu alți studenți pentru a începe să conversezi!
        </p>
        <a 
          href="/friends" 
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          <span className="text-lg">👋</span>
          Începe o conversație nouă
        </a>
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
            {isBlocked && (
              <span className="ml-2 text-orange-500">• Blocat</span>
            )}
          </p>
        </div>
        {conversation.otherParticipant?.user_id && onBlock && onUnblock && onDeleteConversation && (
          <ChatActionsMenu
            otherUserId={conversation.otherParticipant.user_id}
            otherUserName={conversation.otherParticipant.full_name || "Utilizator"}
            isBlocked={isBlocked || false}
            onBlock={onBlock}
            onUnblock={onUnblock}
            onDeleteConversation={onDeleteConversation}
          />
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
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
              const isLastReadMessage = isOwn && message.id === lastReadOwnMessageId;
              const isDelivered = isOwn && !message.read_at;

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
                          <div className={cn(
                            "flex items-center gap-1 mt-1",
                            isOwn ? "justify-end" : ""
                          )}>
                            <p
                              className={cn(
                                "text-[10px]",
                                isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                              )}
                            >
                              {format(new Date(message.created_at), "HH:mm")}
                            </p>
                            {isOwn && (
                              message.read_at ? (
                                <CheckCheck className={cn(
                                  "h-3 w-3",
                                  isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                                )} />
                              ) : (
                                <Check className={cn(
                                  "h-3 w-3",
                                  isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                                )} />
                              )
                            )}
                          </div>
                        )}
                      </div>
                      {isGif && (
                        <div className={cn(
                          "flex items-center gap-1 mt-1",
                          isOwn ? "justify-end" : ""
                        )}>
                          <p
                            className={cn(
                              "text-[10px]",
                              "text-muted-foreground"
                            )}
                          >
                            {format(new Date(message.created_at), "HH:mm")}
                          </p>
                          {isOwn && (
                            message.read_at ? (
                              <CheckCheck className="h-3 w-3 text-muted-foreground" />
                            ) : (
                              <Check className="h-3 w-3 text-muted-foreground" />
                            )
                          )}
                        </div>
                      )}
                      
                      {/* Seen indicator for last read message */}
                      {isLastReadMessage && (
                        <p className="text-[10px] text-muted-foreground text-right mt-0.5">
                          Văzut
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
            
            {/* Typing indicator */}
            {isOtherUserTyping && (
              <div className="flex gap-2 max-w-[80%]">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={conversation.otherParticipant?.avatar_url || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {conversation.otherParticipant?.full_name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t bg-card/50">
        {isBlocked ? (
          <div className="flex items-center justify-center gap-2 py-2 text-muted-foreground">
            <Ban className="h-4 w-4" />
            <span className="text-sm">Ai blocat acest utilizator</span>
          </div>
        ) : (
          <div className="flex gap-2 items-center">
            <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            <GifPicker onGifSelect={handleGifSelect} />
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={handleInputChange}
              placeholder="Scrie un mesaj..."
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
