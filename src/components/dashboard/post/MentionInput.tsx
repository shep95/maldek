import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AtSign } from "lucide-react";

interface MentionInputProps {
  mentionedUser: string;
  onMentionChange: (value: string) => void;
  onMentionSubmit: () => void;
}

export const MentionInput = ({
  mentionedUser,
  onMentionChange,
  onMentionSubmit
}: MentionInputProps) => {
  return (
    <div className="flex gap-2 items-center">
      <Input
        placeholder="Mention a user"
        value={mentionedUser}
        onChange={(e) => onMentionChange(e.target.value)}
        className="flex-1"
      />
      <Button
        variant="outline"
        size="icon"
        onClick={onMentionSubmit}
        className="shrink-0"
      >
        <AtSign className="h-4 w-4" />
      </Button>
    </div>
  );
};