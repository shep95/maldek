import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Languages, Reply, X } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { CommentHeader } from "./CommentHeader";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface CommentCardProps {
  comment: {
    id: string;
    content: string;
    created_at: string;
    parent_id?: string | null;
    user: {
      id: string;
      username: string;
      avatar_url: string | null;
    };
  };
  userLanguage: string;
  onReplySubmit?: (content: string, parentId: string) => Promise<void>;
  level?: number;
  replies?: any[];
}

export const CommentCard = ({ 
  comment, 
  userLanguage,
  onReplySubmit,
  level = 0,
  replies = []
}: CommentCardProps) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const navigate = useNavigate();

  const handleTranslate = async () => {
    if (isTranslating || !userLanguage) return;
    
    try {
      setIsTranslating(true);
      const { data, error } = await supabase.functions.invoke('translate-text', {
        body: { text: comment.content, targetLanguage: userLanguage }
      });

      if (error) throw error;
      setTranslatedContent(data.translatedText);
    } catch (error) {
      console.error('Translation error:', error);
      toast.error("Failed to translate comment");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleReplySubmit = async () => {
    if (!replyContent.trim() || !onReplySubmit) return;

    try {
      await onReplySubmit(replyContent, comment.id);
      setReplyContent("");
      setIsReplying(false);
      toast.success("Reply posted successfully");
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error("Failed to post reply");
    }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Clean the username (remove @ if present)
    const username = comment.user.username.startsWith('@') 
      ? comment.user.username.slice(1) 
      : comment.user.username;
    
    console.log('CommentCard - Navigating to profile:', username);
    navigate(`/@${username}`);
  };

  // Only allow nesting up to 3 levels deep
  const canReply = level < 3;

  return (
    <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
      <Card 
        className={`p-4 transition-all duration-200 hover:bg-accent/5 ${level > 0 ? 'ml-6' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <CommentHeader 
          user={comment.user} 
          timestamp={comment.created_at}
          onProfileClick={handleProfileClick}
        />
        
        <p className="mt-1 text-foreground">{translatedContent || comment.content}</p>
        
        <div className="flex items-center gap-2 mt-2">
          {!translatedContent && userLanguage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleTranslate();
              }}
              disabled={isTranslating}
            >
              <Languages className="h-4 w-4 mr-2" />
              {isTranslating ? "Translating..." : "Translate"}
            </Button>
          )}
          {translatedContent && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setTranslatedContent(null);
              }}
            >
              Show original
            </Button>
          )}
          {canReply && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsReplying(!isReplying);
              }}
            >
              <Reply className="h-4 w-4 mr-2" />
              {isReplying ? "Cancel Reply" : "Reply"}
            </Button>
          )}
        </div>

        {isReplying && (
          <div className="mt-4 space-y-2">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write your reply..."
              className="min-h-[100px]"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsReplying(false);
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReplySubmit();
                }}
                disabled={!replyContent.trim()}
              >
                <Reply className="h-4 w-4 mr-2" />
                Post Reply
              </Button>
            </div>
          </div>
        )}
      </Card>

      {replies.length > 0 && (
        <div className="space-y-3">
          {replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              userLanguage={userLanguage}
              onReplySubmit={onReplySubmit}
              level={level + 1}
              replies={reply.replies || []}
            />
          ))}
        </div>
      )}
    </div>
  );
};