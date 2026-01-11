import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Smile } from "lucide-react";

const EMOJI_CATEGORIES = {
  smileys: {
    name: "Fețe",
    emojis: ["😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😜", "🤪", "😝", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "😮‍💨", "🤥", "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "🥵", "🥶", "🥴", "😵", "🤯", "🤠", "🥳", "🥸", "😎", "🤓", "🧐"]
  },
  gestures: {
    name: "Gesturi",
    emojis: ["👍", "👎", "👊", "✊", "🤛", "🤜", "🤞", "✌️", "🤟", "🤘", "👌", "🤌", "🤏", "👈", "👉", "👆", "👇", "☝️", "✋", "🤚", "🖐️", "🖖", "👋", "🤙", "💪", "🦾", "🙏", "🤝", "👏", "🙌", "👐", "🤲", "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟"]
  },
  objects: {
    name: "Obiecte",
    emojis: ["📚", "📖", "📝", "✏️", "📌", "📎", "🔗", "💻", "🖥️", "⌨️", "🖱️", "📱", "☎️", "📧", "✉️", "📬", "📦", "🎁", "🏆", "🥇", "🥈", "🥉", "⚽", "🏀", "🎮", "🎲", "🎭", "🎨", "🎬", "🎤", "🎧", "🎵", "🎶", "🎹", "🎸", "🎺", "🎻", "🥁", "📷", "📹", "🔍", "🔎", "💡", "🔦", "🕯️", "💰", "💵", "💳", "🛒", "⏰"]
  },
  nature: {
    name: "Natură",
    emojis: ["🌸", "💮", "🏵️", "🌹", "🥀", "🌺", "🌻", "🌼", "🌷", "🌱", "🪴", "🌲", "🌳", "🌴", "🌵", "🌾", "🌿", "☘️", "🍀", "🍁", "🍂", "🍃", "🍄", "🌰", "🦀", "🦞", "🦐", "🦑", "🐙", "🐚", "🐌", "🦋", "🐛", "🐜", "🐝", "🪲", "🐞", "🦗", "🪳", "🦂", "🐢", "🐍", "🦎", "🦖", "🦕", "🐊", "🐸", "🐁", "🐀", "🐿️"]
  },
  food: {
    name: "Mâncare",
    emojis: ["🍎", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶️", "🫑", "🌽", "🥕", "🫒", "🧄", "🧅", "🥔", "🍠", "🥐", "🥖", "🍞", "🥨", "🥯", "🧀", "🥚", "🍳", "🧈", "🥞", "🧇", "🥓", "🥩", "🍗", "🍖", "🦴", "🌭", "🍔", "🍟", "🍕"]
  },
  symbols: {
    name: "Simboluri",
    emojis: ["💯", "🔥", "✨", "⭐", "🌟", "💫", "⚡", "☀️", "🌤️", "⛅", "🌈", "☁️", "🌧️", "⛈️", "❄️", "☃️", "💨", "💧", "💦", "☔", "🎉", "🎊", "🎈", "🎀", "🎗️", "✅", "❌", "❓", "❗", "💤", "💬", "💭", "🗯️", "♠️", "♣️", "♥️", "♦️", "🃏", "🀄", "🔔", "🔕", "📣", "📢", "🔊", "🔉", "🔈", "🔇", "⚠️", "🚫", "🔞"]
  }
};

// Quick reactions for message reaction picker
export const QUICK_REACTIONS = ["❤️", "👍", "😂", "😮", "😢", "😡"];

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  trigger?: React.ReactNode;
}

export function EmojiPicker({ onEmojiSelect, trigger }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (emoji: string) => {
    onEmojiSelect(emoji);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="h-9 w-9" type="button">
            <Smile className="h-5 w-5 text-muted-foreground" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Tabs defaultValue="smileys" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b h-auto p-1 bg-transparent">
            {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
              <TabsTrigger 
                key={key} 
                value={key}
                className="text-xs px-2 py-1 data-[state=active]:bg-muted"
              >
                {category.emojis[0]}
              </TabsTrigger>
            ))}
          </TabsList>
          {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
            <TabsContent key={key} value={key} className="mt-0">
              <ScrollArea className="h-48">
                <div className="grid grid-cols-8 gap-1 p-2">
                  {category.emojis.map((emoji, index) => (
                    <button
                      key={index}
                      className="h-8 w-8 flex items-center justify-center text-xl hover:bg-muted rounded transition-colors"
                      onClick={() => handleSelect(emoji)}
                      type="button"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
