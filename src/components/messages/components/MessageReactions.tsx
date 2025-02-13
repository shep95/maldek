
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Smile } from "lucide-react";

const COMMON_EMOJIS = ['👍', '❤️', '😊', '😂', '🎉', '👏', '🔥', '💯'];

interface MessageReactionsProps {
  reactions: { [key: string]: string[] };
  onReaction: (emoji: string) => Promise<void>;
  isCurrentUser: boolean;
}

export const MessageReactions = ({ reactions, onReaction, isCurrentUser }: MessageReactionsProps) => {
  return (
    <div className="flex items-center gap-1">
      {Object.entries(reactions).map(([emoji, users]) => (
        <Button
          key={emoji}
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={() => onReaction(emoji)}
        >
          {emoji} {users.length}
        </Button>
      ))}
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Smile className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-2" align={isCurrentUser ? "end" : "start"}>
          <div className="grid grid-cols-4 gap-1">
            {COMMON_EMOJIS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onReaction(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
