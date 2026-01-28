import { useState, useRef, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { Send, ArrowLeft, Check, CheckCheck, Ban, FileText, Download, Reply, Forward, X } from "lucide-react";
import { Message, Conversation } from "@/hooks/useMessages";
import { useMessageReactions } from "@/hooks/useMessageReactions";
import { EmojiPicker } from "@/components/EmojiPicker";
import { GifPicker } from "@/components/GifPicker";
import { MessageReactions } from "@/components/MessageReactions";
import { ChatActionsMenu } from "@/components/ChatActionsMenu";
import { MessageFileUpload } from "@/components/MessageFileUpload";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

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
  onForwardMessage?: (message: Message) => void;
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
  onForwardMessage,
}: MessageThreadProps) {
  const [newMessage, setNewMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMobile = useIsMobile();
  
  const { 
    fetchReactions, 
    addReaction, 
    removeReaction, 
    getReactionsForMessage 
  } = useMessageReactions(conversation?.id || null);

  // Scroll to bottom when messages change or conversation changes
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, []);

  // Scroll to bottom when messages load or new messages arrive
  useEffect(() => {
    // Small delay to ensure DOM is updated
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages, conversation?.id, scrollToBottom]);

  // Also scroll when typing indicator appears
  useEffect(() => {
    if (isOtherUserTyping) {
      scrollToBottom();
    }
  }, [isOtherUserTyping, scrollToBottom]);

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
      // If replying, prepend the reply context
      const messageContent = replyingTo 
        ? `[Răspuns la: "${replyingTo.content.substring(0, 50)}${replyingTo.content.length > 50 ? '...' : ''}"]\n\n${newMessage}`
        : newMessage;
      onSendMessage(messageContent);
      setNewMessage("");
      setReplyingTo(null);
      if (onTyping) onTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleReply = (message: Message) => {
    setReplyingTo(message);
    inputRef.current?.focus();
  };

  const handleForward = (message: Message) => {
    if (onForwardMessage) {
      onForwardMessage(message);
    }
  };

  const cancelReply = () => {
    setReplyingTo(null);
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

  // Check if content is an image URL
  const isImageUrl = (content: string) => {
    return content.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i) !== null ||
           content.includes("message-attachments");
  };

  // Check if content is a file URL
  const isFileUrl = (content: string) => {
    return content.includes("message-attachments") && !isImageUrl(content);
  };

  // Get file name from URL
  const getFileName = (url: string) => {
    const parts = url.split("/");
    const fileName = parts[parts.length - 1].split("?")[0];
    return decodeURIComponent(fileName);
  };

  // Handle file upload completion
  const handleFileUploaded = (fileUrl: string) => {
    onSendMessage(fileUrl);
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
      <div className="flex-1 overflow-y-auto p-4" ref={scrollContainerRef}>
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
              const isImage = isImageUrl(message.content) && !isGif;
              const isFile = isFileUrl(message.content) && !isImage;
              const isMedia = isGif || isImage;
              const isLastReadMessage = isOwn && message.id === lastReadOwnMessageId;
              const isReply = message.content.startsWith('[Răspuns la:');

              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                        {format(new Date(message.created_at), "PP", { locale: ro })}
                      </span>
                    </div>
                  )}
                  <ContextMenu>
                    <ContextMenuTrigger>
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
                              isMedia ? "p-0" : "px-4 py-2",
                              isOwn
                                ? isMedia ? "rounded-br-md" : "bg-primary text-primary-foreground rounded-br-md"
                                : isMedia ? "rounded-bl-md" : "bg-muted rounded-bl-md"
                            )}
                          >
                            {isGif || isImage ? (
                              <img 
                                src={message.content} 
                                alt={isGif ? "GIF" : "Imagine"} 
                                className="max-w-[240px] rounded-2xl cursor-pointer"
                                loading="lazy"
                                onClick={() => window.open(message.content, "_blank")}
                              />
                            ) : isFile ? (
                              <a
                                href={message.content}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                  "flex items-center gap-2 px-4 py-2 rounded-2xl",
                                  isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                                )}
                              >
                                <FileText className="h-5 w-5 flex-shrink-0" />
                                <span className="text-sm truncate max-w-[180px]">
                                  {getFileName(message.content)}
                                </span>
                                <Download className="h-4 w-4 flex-shrink-0" />
                              </a>
                            ) : (
                              <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
                            )}
                            {!isMedia && !isFile && (
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
                          {(isGif || isImage) && (
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
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem onClick={() => handleReply(message)}>
                        <Reply className="h-4 w-4 mr-2" />
                        Răspunde
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => handleForward(message)}>
                        <Forward className="h-4 w-4 mr-2" />
                        Trimite mai departe
                      </ContextMenuItem>
                      {isOwn && onDeleteMessage && (
                        <ContextMenuItem 
                          onClick={() => onDeleteMessage(message.id)}
                          className="text-destructive"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Șterge
                        </ContextMenuItem>
                      )}
                    </ContextMenuContent>
                  </ContextMenu>
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
            
            {/* Invisible scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input - with safe area padding for mobile */}
      <form 
        onSubmit={handleSubmit} 
        className="border-t bg-card/50 flex-shrink-0"
        style={{ 
          paddingBottom: isMobile ? 'env(safe-area-inset-bottom)' : undefined 
        }}
      >
        {isBlocked ? (
          <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
            <Ban className="h-4 w-4" />
            <span className="text-sm">Ai blocat acest utilizator</span>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {/* Reply preview */}
            {replyingTo && (
              <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border-l-2 border-primary">
                <Reply className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <p className="text-sm text-muted-foreground truncate flex-1">
                  Răspuns la: "{replyingTo.content.substring(0, 50)}{replyingTo.content.length > 50 ? '...' : ''}"
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={cancelReply}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <div className="flex gap-2 items-center">
              <MessageFileUpload
                userId={currentUserId}
                conversationId={conversation.id}
                onFileUploaded={handleFileUploaded}
              />
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
              <GifPicker onGifSelect={handleGifSelect} />
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={handleInputChange}
                placeholder={replyingTo ? "Scrie răspunsul..." : "Scrie un mesaj..."}
                className="flex-1"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!newMessage.trim()}
                className="h-11 w-11 min-h-[44px] min-w-[44px]"
                haptic="light"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
