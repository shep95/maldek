import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Languages, Check, Reply, X, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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

  // Add null check for comment and comment.user
  if (!comment || !comment.user) {
    console.error('Invalid comment data:', comment);
    return null;
  }

  const { data: subscription } = useQuery({
    queryKey: ['user-subscription', comment.user.id],
    queryFn: async () => {
      try {
        console.log('Fetching subscription for user:', comment.user.id);
        const { data, error } = await supabase
          .from('user_subscriptions')
          .select(`
            *,
            tier:subscription_tiers(*)
          `)
          .eq('user_id', comment.user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (error) {
          console.error('Error fetching subscription:', error);
          return null;
        }

        console.log('Subscription data:', data);
        return data;
      } catch (error) {
        console.error('Error in subscription query:', error);
        return null;
      }
    },
    enabled: !!comment.user.id // Only run query if user.id exists
  });

  const getVerificationBadge = () => {
    if (!subscription?.tier?.name) return null;

    const badgeConfig = {
      'True Emperor': {
        icon: Crown,
        color: "text-yellow-500",
        shadow: "shadow-[0_0_12px_rgba(234,179,8,0.6)]",
        border: "border-yellow-500"
      },
      'Creator': {
        icon: Check,
        color: "text-orange-500",
        shadow: "shadow-[0_0_12px_rgba(249,115,22,0.6)]",
        border: "border-orange-500"
      },
      'Business': {
        icon: Check,
        color: "text-purple-500",
        shadow: "shadow-[0_0_12px_rgba(168,85,247,0.6)]",
        border: "border-purple-500"
      }
    };

    const config = badgeConfig[subscription.tier.name as keyof typeof badgeConfig];
    if (!config) return null;

    const Icon = config.icon;

    return (
      <div className="group relative">
        <div className={cn(
          "h-5 w-5 rounded-full flex items-center justify-center",
          "border-2 bg-black/50 backdrop-blur-sm",
          config.border
        )}>
          <Icon className={cn("h-3 w-3", config.color, config.shadow)} />
        </div>
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-background/90 backdrop-blur-sm text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap border border-border">
          {subscription.tier.name}
        </div>
      </div>
    );
  };

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

  return (
    <div className="space-y-3">
      <Card className={cn(
        "p-4 transition-all duration-200",
        "bg-[#0d0d0d] hover:bg-[#151515] border-[#222226]",
        "backdrop-blur-sm shadow-lg",
        level > 0 ? 'ml-6' : ''
      )}>
        <div className="flex items-start gap-3">
          <Avatar 
            className="h-8 w-8 cursor-pointer ring-2 ring-[#222226] hover:ring-orange-500 transition-all" 
            onClick={() => navigate(`/@${comment.user.username}`)}
          >
            <AvatarImage src={comment.user.avatar_url || undefined} />
            <AvatarFallback className="bg-[#151515] text-orange-500">
              {comment.user.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <div className="flex items-center gap-1">
                <h4 
                  className="font-semibold cursor-pointer text-gray-100 hover:text-orange-500 transition-colors" 
                  onClick={() => navigate(`/@${comment.user.username}`)}
                >
                  @{comment.user.username}
                </h4>
                {subscription && getVerificationBadge()}
              </div>
              <span className="text-sm text-gray-500">
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="mt-1 text-gray-200 leading-relaxed">
              {translatedContent || comment.content}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {!translatedContent && userLanguage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleTranslate}
                  disabled={isTranslating}
                  className="text-gray-400 hover:text-orange-500 hover:bg-orange-500/10"
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
                  className="text-gray-400 hover:text-orange-500 hover:bg-orange-500/10"
                >
                  Show original
                </Button>
              )}
              {level < 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsReplying(!isReplying)}
                  className="text-gray-400 hover:text-orange-500 hover:bg-orange-500/10"
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
                  className="min-h-[100px] bg-[#151515] border-[#222226] text-gray-200 placeholder:text-gray-500 focus:ring-orange-500"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsReplying(false)}
                    className="text-gray-400 hover:text-orange-500 hover:bg-orange-500/10"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleReplySubmit}
                    disabled={!replyContent.trim()}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
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

      {replies.length > 0 && (
        <div className="space-y-3 border-l-2 border-[#222226] pl-4">
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