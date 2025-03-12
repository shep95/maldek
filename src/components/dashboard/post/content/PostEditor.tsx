
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface PostEditorProps {
  content: string;
  onEditContentChange: (content: string) => void;
  isPremiumUser?: boolean;
}

export const PostEditor = ({ 
  content, 
  onEditContentChange, 
  isPremiumUser = false 
}: PostEditorProps) => {
  return (
    <div className="space-y-2">
      <Textarea
        value={content}
        onChange={(e) => onEditContentChange(e.target.value)}
        className={cn(
          "w-full min-h-[100px] p-4 bg-background/50 backdrop-blur-sm",
          "border border-input focus:border-primary",
          "rounded-lg resize-none transition-all duration-200",
          "placeholder:text-muted-foreground focus:ring-1 focus:ring-primary"
        )}
        placeholder="What's on your mind?"
        autoFocus
      />
      
      {!isPremiumUser && content.length > 0 && (
        <div className="text-xs text-muted-foreground">
          <span className="float-right">
            {content.length}/280 characters
          </span>
        </div>
      )}
      {isPremiumUser && content.length > 0 && (
        <div className="text-xs text-primary">
          <span className="float-right">
            Premium user - no character limit
          </span>
        </div>
      )}
    </div>
  );
};
