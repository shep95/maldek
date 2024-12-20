import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Link, Hash, AtSign, Image, Smile } from "lucide-react";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onMention?: (username: string) => void;
  onHashtag?: (tag: string) => void;
  className?: string;
  placeholder?: string;
}

export const RichTextEditor = ({
  value,
  onChange,
  onMention,
  onHashtag,
  className,
  placeholder = "What's happening?"
}: RichTextEditorProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === '@') {
      console.log('Mention triggered');
      onMention?.('');
    } else if (e.key === '#') {
      console.log('Hashtag triggered');
      onHashtag?.('');
    }
  };

  const insertAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const textBefore = value.substring(0, startPos);
    const textAfter = value.substring(endPos);

    onChange(textBefore + textToInsert + textAfter);
    
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = startPos + textToInsert.length;
      textarea.focus();
    }, 0);
  };

  const handleFormat = (format: 'bold' | 'italic' | 'link') => {
    switch (format) {
      case 'bold':
        insertAtCursor('**bold text**');
        break;
      case 'italic':
        insertAtCursor('*italic text*');
        break;
      case 'link':
        insertAtCursor('[link text](url)');
        break;
    }
  };

  return (
    <div className="space-y-2">
      <div className={cn(
        "flex gap-2 p-2 rounded-t-lg border border-b-0 border-input bg-background",
        isFocused && "border-primary"
      )}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('bold')}
          type="button"
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('italic')}
          type="button"
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('link')}
          type="button"
          className="h-8 w-8 p-0"
        >
          <Link className="h-4 w-4" />
        </Button>
        <div className="h-8 w-[1px] bg-border mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertAtCursor('#')}
          type="button"
          className="h-8 w-8 p-0"
        >
          <Hash className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertAtCursor('@')}
          type="button"
          className="h-8 w-8 p-0"
        >
          <AtSign className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => document.getElementById('media-upload')?.click()}
          type="button"
          className="h-8 w-8 p-0"
        >
          <Image className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertAtCursor(':)')}
          type="button"
          className="h-8 w-8 p-0"
        >
          <Smile className="h-4 w-4" />
        </Button>
      </div>

      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className={cn(
          "min-h-[120px] rounded-t-none resize-none transition-all duration-200",
          "focus:ring-1 focus:ring-primary",
          className
        )}
      />

      <div className="text-xs text-muted-foreground">
        {value.length > 0 && (
          <span className="float-right">
            {value.length}/280 characters
          </span>
        )}
      </div>
    </div>
  );
};