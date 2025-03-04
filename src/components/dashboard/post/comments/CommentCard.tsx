
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Image } from "lucide-react";
import { toast } from "sonner";
import { Comment } from "@/utils/commentUtils";
import { GifPicker } from "../detail/GifPicker";
import { CommentLikeAction } from "./CommentLikeAction";
import { useSession } from "@supabase/auth-helpers-react";

interface CommentCardProps {
  comment: Comment;
  userLanguage: string;
  onReplySubmit: (content: string, parentId: string, gifUrl?: string) => Promise<void>;
  level?: number;
  replies?: Comment[];
}

export const CommentCard = ({
  comment,
  userLanguage,
  onReplySubmit,
  level = 0,
  replies = []
}: CommentCardProps) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const session = useSession();
  const currentUserId = session?.user?.id || '';

  console.log("Comment data:", comment); // Debug log to see the comment data

  // Early return if comment or user data is missing
  if (!comment || !comment.user) {
    console.error("Invalid comment data:", comment);
    return null;
  }

  const handleReplySubmit = async () => {
    if ((!replyContent.trim() && !selectedGif) || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onReplySubmit(replyContent, comment.id, selectedGif || undefined);
      setReplyContent("");
      setSelectedGif(null);
      setIsReplying(false);
      toast.success("Reply added successfully");
    } catch (error) {
      console.error("Failed to submit reply:", error);
      toast.error("Failed to add reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGifSelect = (gifUrl: string) => {
    setSelectedGif(gifUrl);
    setShowGifPicker(false);
  };

  // Get the first letter of username safely
  const userInitial = comment.user.username ? comment.user.username[0].toUpperCase() : '?';

  return (
    <div className="space-y-3">
      <div className={cn(
        "p-4 transition-all duration-200",
        "bg-[#0d0d0d] hover:bg-[#151515] border-[#222226]",
        "backdrop-blur-sm shadow-lg",
        level > 0 ? 'ml-6' : ''
      )}>
        <div className="flex items-start gap-3">
          <Avatar 
            className="h-8 w-8 cursor-pointer ring-2 ring-[#222226] hover:ring-orange-500 transition-all"
          >
            <AvatarImage src={comment.user.avatar_url || undefined} />
            <AvatarFallback className="bg-[#151515] text-orange-500">
              {userInitial}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <h4 className="font-semibold text-gray-100">
                @{comment.user.username}
              </h4>
              <span className="text-sm text-gray-500">
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
            </div>
            
            {comment.content && (
              <p className="mt-1 text-gray-200 leading-relaxed">
                {comment.content}
              </p>
            )}
            
            {comment.gif_url && (
              <div className="mt-2">
                <img 
                  src={comment.gif_url} 
                  alt="Comment GIF" 
                  className="max-w-[200px] h-auto rounded-lg"
                  onError={(e) => {
                    console.error("Failed to load GIF:", comment.gif_url);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

            <div className="flex items-center gap-2 mt-2">
              <CommentLikeAction 
                commentId={comment.id}
                authorId={comment.user.id}
                currentUserId={currentUserId}
                initialLikes={comment.likes || 0}
                initialIsLiked={comment.isLiked || false}
              />
              
              {level < 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsReplying(!isReplying)}
                  className="text-gray-400 hover:text-orange-500 hover:bg-orange-500/10"
                >
                  Reply
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
                
                {selectedGif && (
                  <div className="relative">
                    <img 
                      src={selectedGif} 
                      alt="Selected GIF" 
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1"
                      onClick={() => setSelectedGif(null)}
                    >
                      Remove
                    </Button>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowGifPicker(!showGifPicker)}
                    className="text-gray-400 hover:text-orange-500 hover:bg-orange-500/10"
                  >
                    <Image className="h-4 w-4 mr-2" />
                    GIF
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsReplying(false);
                      setReplyContent("");
                      setSelectedGif(null);
                    }}
                    className="text-gray-400 hover:text-orange-500 hover:bg-orange-500/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleReplySubmit}
                    disabled={(!replyContent.trim() && !selectedGif) || isSubmitting}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Post Reply
                  </Button>
                </div>

                {showGifPicker && (
                  <div className="relative z-50">
                    <GifPicker onSelect={handleGifSelect} onClose={() => setShowGifPicker(false)} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

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
