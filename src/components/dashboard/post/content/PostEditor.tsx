
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface PostEditorProps {
  content: string;
  onEditContentChange: (content: string) => void;
  isPremiumUser?: boolean;
  characterLimit?: number;
}

export const PostEditor = ({ 
  content, 
  onEditContentChange, 
  isPremiumUser = true, // Default to true now that everyone is premium
  characterLimit = 99999 // Very high limit effectively means unlimited
}: PostEditorProps) => {
  // Calculate remaining characters
  const remainingChars = characterLimit - content.length;
  const isNearLimit = remainingChars <= 20 && !isPremiumUser;
  const isOverLimit = remainingChars < 0 && !isPremiumUser;

  return (
    <div className="space-y-2">
      <Textarea
        value={content}
        onChange={(e) => onEditContentChange(e.target.value)}
        className={cn(
          "w-full min-h-[100px] p-4 bg-background/50 backdrop-blur-sm",
          "border border-input focus:border-primary",
          "rounded-lg resize-none transition-all duration-200",
          "placeholder:text-muted-foreground focus:ring-1 focus:ring-primary",
          isOverLimit && "border-red-500 focus:border-red-500 focus:ring-red-500"
        )}
        placeholder="What's on your mind?"
        autoFocus
      />
      
      <div className="text-xs text-primary">
        <span className="float-right">
          Unlimited character limit enabled
        </span>
      </div>
    </div>
  );
};
