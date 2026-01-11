import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Image, Search, Loader2 } from "lucide-react";

// Using Tenor API (free, no API key required for basic usage)
const TENOR_API_KEY = "AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ"; // Public Tenor API key

interface TenorGif {
  id: string;
  media_formats: {
    tinygif: { url: string };
    gif: { url: string };
  };
}

interface GifPickerProps {
  onGifSelect: (gifUrl: string) => void;
}

export function GifPicker({ onGifSelect }: GifPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [gifs, setGifs] = useState<TenorGif[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const searchGifs = useCallback(async (query: string) => {
    if (!query.trim()) {
      setGifs([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    
    try {
      const response = await fetch(
        `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${TENOR_API_KEY}&limit=20&media_filter=tinygif,gif`
      );
      const data = await response.json();
      setGifs(data.results || []);
    } catch (error) {
      console.error("Error fetching GIFs:", error);
      setGifs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTrending = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://tenor.googleapis.com/v2/featured?key=${TENOR_API_KEY}&limit=20&media_filter=tinygif,gif`
      );
      const data = await response.json();
      setGifs(data.results || []);
    } catch (error) {
      console.error("Error fetching trending GIFs:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && gifs.length === 0) {
      loadTrending();
    }
  };

  const handleSelect = (gif: TenorGif) => {
    const gifUrl = gif.media_formats.gif?.url || gif.media_formats.tinygif?.url;
    onGifSelect(gifUrl);
    setOpen(false);
    setSearch("");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchGifs(search);
  };

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9" type="button">
          <Image className="h-5 w-5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <form onSubmit={handleSearch} className="p-2 border-b">
          <div className="flex gap-2">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Caută GIF-uri..."
              className="h-8 text-sm"
            />
            <Button type="submit" size="icon" className="h-8 w-8 shrink-0">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>
        
        <ScrollArea className="h-64">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : gifs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              {hasSearched ? "Niciun GIF găsit" : "Caută un GIF"}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1 p-2">
              {gifs.map((gif) => (
                <button
                  key={gif.id}
                  className="relative aspect-video overflow-hidden rounded hover:ring-2 ring-primary transition-all"
                  onClick={() => handleSelect(gif)}
                  type="button"
                >
                  <img
                    src={gif.media_formats.tinygif?.url}
                    alt="GIF"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="p-1 border-t text-center">
          <span className="text-[10px] text-muted-foreground">Powered by Tenor</span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
