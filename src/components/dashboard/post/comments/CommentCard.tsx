import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Languages, Check, Reply, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";

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
  const navigate = useNavigate();
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const { data: subscription } = useQuery({
    queryKey: ['user-subscription', comment.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          tier:subscription_tiers(*)
        `)
        .eq('user_id', comment.user.id)
        .eq('status', 'active')
        .single();

      if (error) {
        console.error('Error fetching subscription:', error);
        return null;
      }

      return data;
    },
  });

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

  // Only allow nesting up to 3 levels deep
  const canReply = level < 3;

  return (
    <div className="space-y-3">
      <Card className={`p-4 transition-all duration-200 hover:bg-accent/5 ${level > 0 ? 'ml-6' : ''}`}>
        <div className="flex items-start gap-3">
          <Avatar 
            className="h-8 w-8 cursor-pointer" 
            onClick={() => navigate(`/@${comment.user.username}`)}
          >
            <AvatarImage src={comment.user.avatar_url || undefined} />
            <AvatarFallback>{comment.user.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <div className="flex items-center gap-1">
                <h4 
                  className="font-semibold cursor-pointer hover:underline" 
                  onClick={() => navigate(`/@${comment.user.username}`)}
                >
                  @{comment.user.username}
                </h4>
                {subscription?.tier?.name === 'Creator' && (
                  <div className="group relative">
                    <div className="h-6 w-6 rounded-full flex items-center justify-center shadow-[0_0_12px_rgba(249,115,22,0.6)] border-2 border-orange-500 bg-black/50 backdrop-blur-sm">
                      <Check className="h-4 w-4 text-orange-500 stroke-[3]" />
                    </div>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-background/90 backdrop-blur-sm text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap border border-border">
                      Creator
                    </div>
                  </div>
                )}
                {subscription?.tier?.name === 'Business' && (
                  <div className="group relative">
                    <div className="h-6 w-6 rounded-full flex items-center justify-center shadow-[0_0_12px_rgba(234,179,8,0.6)] border-2 border-yellow-500 bg-black/50 backdrop-blur-sm">
                      <Check className="h-4 w-4 text-yellow-500 stroke-[3]" />
                    </div>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-background/90 backdrop-blur-sm text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap border border-border">
                      Business
                    </div>
                  </div>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="mt-1 text-foreground">{translatedContent || comment.content}</p>
            <div className="flex items-center gap-2 mt-2">
              {!translatedContent && userLanguage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleTranslate}
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
                  onClick={() => setTranslatedContent(null)}
                >
                  Show original
                </Button>
              )}
              {canReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsReplying(!isReplying)}
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
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsReplying(false)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleReplySubmit}
                    disabled={!replyContent.trim()}
                  >
                    <Reply className="h-4 w-4 mr-2" />
                    Post Reply
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Render nested replies */}
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