import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Link, Hash, AtSign } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onMention?: (username: string) => void;
  onHashtag?: (tag: string) => void;
}

export const RichTextEditor = ({
  value,
  onChange,
  onMention,
  onHashtag
}: RichTextEditorProps) => {
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === '@') {
      setCursorPosition(e.currentTarget.selectionStart || 0);
    } else if (e.key === '#') {
      setCursorPosition(e.currentTarget.selectionStart || 0);
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
    
    // Set cursor position after inserted text
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
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleFormat('bold')}
          type="button"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleFormat('italic')}
          type="button"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleFormat('link')}
          type="button"
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => insertAtCursor('#')}
          type="button"
        >
          <Hash className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => insertAtCursor('@')}
          type="button"
        >
          <AtSign className="h-4 w-4" />
        </Button>
      </div>

      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="What's on your mind?"
        className="min-h-[120px]"
      />
    </div>
  );
};