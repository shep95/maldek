
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
  isPremiumUser = false,
  characterLimit = 280
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
      
      {!isPremiumUser && content.length > 0 && (
        <div className={cn(
          "text-xs flex justify-between items-center",
          isNearLimit && !isOverLimit ? "text-yellow-500" : "",
          isOverLimit ? "text-red-500" : "text-muted-foreground"
        )}>
          <span className={isOverLimit ? "text-red-500 font-medium" : ""}>
            {isOverLimit ? "Character limit exceeded" : ""}
          </span>
          <span className="float-right">
            {content.length}/{characterLimit} characters
          </span>
        </div>
      )}
      {isPremiumUser && content.length > 0 && (
        <div className="text-xs text-primary">
          <span className="float-right">
            Premium user - {characterLimit > 280 ? `${characterLimit} character limit` : "no character limit"}
          </span>
        </div>
      )}
    </div>
  );
};
