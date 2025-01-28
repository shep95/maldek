import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface PostEditorProps {
  content: string;
  onEditContentChange: (content: string) => void;
}

export const PostEditor = ({ content, onEditContentChange }: PostEditorProps) => {
  return (
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
  );
};