import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, MoreVertical, Smile, Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Message } from "@/types/messages";
import { useState } from "react";
import { EmojiPicker } from "./EmojiPicker";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
  onReply: () => void;
  onStatusUpdate: (messageId: string, status: string) => void;
}

export const ChatMessage = ({
  message,
  isCurrentUser,
  onReply,
  onStatusUpdate,
}: ChatMessageProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    try {
      setIsTranslating(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: settings } = await supabase
        .from('user_settings')
        .select('preferred_language')
        .eq('user_id', user.id)
        .single();

      if (!settings?.preferred_language) {
        toast.error("Please set your preferred language in settings first");
        return;
      }

      const { data, error } = await supabase.functions.invoke('translate-text', {
        body: { text: message.content, targetLanguage: settings.preferred_language }
      });

      if (error) throw error;

      // Update message with translation
      const { error: updateError } = await supabase
        .from('messages')
        .update({
          translated_content: {
            ...message.translated_content,
            [settings.preferred_language]: data.translatedText
          }
        })
        .eq('id', message.id);

      if (updateError) throw updateError;

      toast.success("Message translated");
    } catch (error) {
      console.error('Translation error:', error);
      toast.error("Failed to translate message");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleReaction = async (emoji: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({
          reactions: {
            ...message.reactions,
            [emoji]: [...(message.reactions[emoji] || []), supabase.auth.user()?.id]
          }
        })
        .eq('id', message.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error("Failed to add reaction");
    }
  };

  return (
    <div
      className={cn(
        "flex gap-2",
        isCurrentUser ? "justify-end" : "justify-start"
      )}
    >
      {!isCurrentUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.sender.avatar_url || ''} alt={message.sender.username} />
          <AvatarFallback>{message.sender.username[0]}</AvatarFallback>
        </Avatar>
      )}
      <div className="relative group">
        <div
          className={cn(
            "max-w-[70%] rounded-lg p-3",
            isCurrentUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          )}
        >
          {message.reply_to_id && (
            <div className="text-xs opacity-70 mb-1">
              Replying to a message...
            </div>
          )}
          <p className="text-sm">{message.content}</p>
          {message.media_urls && message.media_urls.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.media_urls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt="Message attachment"
                  className="max-w-full rounded"
                />
              ))}
            </div>
          )}
          {Object.entries(message.reactions || {}).map(([emoji, users]) => (
            <div key={emoji} className="inline-flex items-center text-xs bg-background/20 rounded px-1 mr-1 mt-1">
              {emoji} {users.length}
            </div>
          ))}
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs opacity-70">
              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
              {message.is_edited && " (edited)"}
            </span>
            {message.read_at && isCurrentUser && (
              <span className="text-xs opacity-70">Read</span>
            )}
          </div>
        </div>
        <div className={cn(
          "absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity",
          isCurrentUser ? "left-0 -translate-x-full" : "right-0 translate-x-full"
        )}>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowEmojiPicker(true)}
            >
              <Smile className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onReply}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleTranslate}
              disabled={isTranslating}
            >
              <Languages className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {showEmojiPicker && (
            <EmojiPicker
              onSelect={(emoji) => {
                handleReaction(emoji);
                setShowEmojiPicker(false);
              }}
              onClose={() => setShowEmojiPicker(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};