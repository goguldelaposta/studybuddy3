import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Search, X, MessageSquare, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  content: string;
  created_at: string;
  conversation_id: string;
  sender_id: string;
  other_user_name?: string;
}

interface MessageSearchProps {
  onResultClick: (conversationId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function MessageSearch({ onResultClick, isOpen, onClose }: MessageSearchProps) {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const searchMessages = useCallback(async (searchQuery: string) => {
    if (!user || !searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      // Get user's conversations
      const { data: convos } = await supabase
        .from("conversations")
        .select("id, participant_1, participant_2")
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`);

      if (!convos || convos.length === 0) {
        setResults([]);
        return;
      }

      const convoIds = convos.map((c) => c.id);

      // Search messages
      const { data: messages, error } = await supabase
        .from("messages")
        .select("id, content, created_at, conversation_id, sender_id")
        .in("conversation_id", convoIds)
        .ilike("content", `%${searchQuery}%`)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      // Get other user names
      const otherUserIds = new Set<string>();
      messages?.forEach((msg) => {
        const convo = convos.find((c) => c.id === msg.conversation_id);
        if (convo) {
          const otherId = convo.participant_1 === user.id ? convo.participant_2 : convo.participant_1;
          otherUserIds.add(otherId);
        }
      });

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", Array.from(otherUserIds));

      const enrichedResults = messages?.map((msg) => {
        const convo = convos.find((c) => c.id === msg.conversation_id);
        const otherId = convo?.participant_1 === user.id ? convo?.participant_2 : convo?.participant_1;
        const profile = profiles?.find((p) => p.user_id === otherId);
        return {
          ...msg,
          other_user_name: profile?.full_name || "Utilizator",
        };
      });

      setResults(enrichedResults || []);
    } catch (error) {
      console.error("Error searching messages:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchMessages(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchMessages]);

  const handleResultClick = (conversationId: string) => {
    onResultClick(conversationId);
    onClose();
    setQuery("");
    setResults([]);
  };

  const highlightMatch = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text;
    const regex = new RegExp(`(${searchQuery})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-primary/30 text-foreground rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col">
      <div className="p-4 border-b flex items-center gap-3">
        <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        <Input
          placeholder="Caută în mesaje..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          className="flex-1"
        />
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              {query.trim() ? "Niciun rezultat găsit" : "Tastează pentru a căuta în mesaje"}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {results.map((result) => (
              <button
                key={result.id}
                onClick={() => handleResultClick(result.conversation_id)}
                className="w-full p-4 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{result.other_user_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(result.created_at), "d MMM, HH:mm", { locale: ro })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {highlightMatch(result.content, query)}
                </p>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
