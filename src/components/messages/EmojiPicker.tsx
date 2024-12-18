import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const COMMON_EMOJIS = ['👍', '❤️', '😊', '😂', '🎉', '👏', '🔥', '💯'];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export const EmojiPicker = ({ onSelect, onClose }: EmojiPickerProps) => {
  return (
    <Card className="absolute bottom-full mb-2 p-2 grid grid-cols-4 gap-1 z-50">
      {COMMON_EMOJIS.map((emoji) => (
        <Button
          key={emoji}
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => onSelect(emoji)}
        >
          {emoji}
        </Button>
      ))}
    </Card>
  );
};