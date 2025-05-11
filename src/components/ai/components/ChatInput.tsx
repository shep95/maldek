
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ChatInputProps {
  onSubmit: (content: string, image: File | null) => void;
  isLoading: boolean;
}

export const ChatInput = ({ onSubmit, isLoading }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || isLoading) return;
    
    onSubmit(input.trim(), selectedImage);
    setInput("");
    setSelectedImage(null);
    
    // Reset file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-2 sm:p-4 border-t border-muted">
      {selectedImage && (
        <div className="mb-2 p-2 bg-muted rounded-lg flex items-center justify-between">
          <span className="text-sm truncate">{selectedImage.name}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedImage(null)}
          >
            Remove
          </Button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              if (file.size > 100 * 1024) {  // Changed to 100KB
                toast.error("Image must be less than 100KB");
                return;
              }
              if (!file.type.startsWith('image/')) {
                toast.error("Only image files are allowed");
                return;
              }
              setSelectedImage(file);
              toast.success("Image selected");
            }
          }}
        />
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message Daarp..."
          className="min-h-[2.5rem] max-h-32 bg-background text-sm sm:text-base"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
          <Button type="submit" size="icon" className="shrink-0 bg-accent hover:bg-accent/90">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};
