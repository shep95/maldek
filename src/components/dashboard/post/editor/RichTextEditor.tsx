import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Link, Hash, AtSign, Image, Smile, Code } from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { EmojiPicker } from "@/components/messages/EmojiPicker";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [userSuggestions, setUserSuggestions] = useState<Array<{
    id: string;
    username: string;
    avatar_url: string | null;
  }>>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastAtSymbolIndex = useRef<number>(-1);

  const fetchUserSuggestions = useCallback(async (searchTerm: string) => {
    console.log('Fetching user suggestions for:', searchTerm);
    try {
      const { data: users, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${searchTerm}%`)
        .limit(5);

      if (error) throw error;
      console.log('Found users:', users);
      setUserSuggestions(users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === '@') {
      console.log('@ symbol detected');
      lastAtSymbolIndex.current = e.currentTarget.selectionStart;
      setShowMentionSuggestions(true);
      setMentionSearch("");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (lastAtSymbolIndex.current !== -1) {
      const currentPosition = e.target.selectionStart;
      const textAfterAt = newValue.slice(lastAtSymbolIndex.current + 1, currentPosition);
      
      if (textAfterAt.includes(' ') || currentPosition <= lastAtSymbolIndex.current) {
        setShowMentionSuggestions(false);
        lastAtSymbolIndex.current = -1;
      } else {
        setMentionSearch(textAfterAt);
        fetchUserSuggestions(textAfterAt);
      }
    }
  };

  const handleSelectUser = (username: string) => {
    if (textareaRef.current && lastAtSymbolIndex.current !== -1) {
      const beforeMention = value.slice(0, lastAtSymbolIndex.current);
      const afterMention = value.slice(textareaRef.current.selectionStart);
      const newValue = `${beforeMention}@${username} ${afterMention}`;
      onChange(newValue);
      onMention?.(username);
    }
    setShowMentionSuggestions(false);
    lastAtSymbolIndex.current = -1;
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

  const handleFormat = (format: 'bold' | 'italic' | 'link' | 'code') => {
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
      case 'code':
        insertAtCursor('\n```\ncode block\n```\n');
        break;
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    insertAtCursor(emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="space-y-2 relative">
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('code')}
          type="button"
          className="h-8 w-8 p-0"
        >
          <Code className="h-4 w-4" />
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
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          type="button"
          className="h-8 w-8 p-0"
        >
          <Smile className="h-4 w-4" />
        </Button>
      </div>

      {showEmojiPicker && (
        <div className="absolute right-0 z-50">
          <EmojiPicker
            onSelect={handleEmojiSelect}
            onClose={() => setShowEmojiPicker(false)}
          />
        </div>
      )}

      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
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

        {showMentionSuggestions && userSuggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg">
            <ScrollArea className="max-h-48">
              {userSuggestions.map((user) => (
                <button
                  key={user.id}
                  className="w-full px-4 py-2 text-left hover:bg-accent/50 flex items-center gap-2"
                  onClick={() => handleSelectUser(user.username)}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span>@{user.username}</span>
                </button>
              ))}
            </ScrollArea>
          </div>
        )}
      </div>

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