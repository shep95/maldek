
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, ThumbsUp, ThumbsDown, Share2 } from "lucide-react";

interface VideoControlsProps {
  onDownload?: () => void;
  onOpenOriginal?: () => void;
  onLike?: () => void;
  onDislike?: () => void;
  onShare?: () => void;
  isLiked?: boolean;
  isDisliked?: boolean;
  likesCount?: number;
  dislikesCount?: number;
  showSocialActions?: boolean;
  onClose?: () => void;
}

export const VideoControls = ({ 
  onDownload, 
  onOpenOriginal, 
  onLike,
  onDislike,
  onShare,
  isLiked,
  isDisliked,
  likesCount = 0,
  dislikesCount = 0,
  showSocialActions = false,
  onClose 
}: VideoControlsProps) => {
  return (
    <div className="absolute top-4 right-4 flex gap-2 z-50">
      {showSocialActions && (
        <>
          <Button
            variant={isLiked ? "default" : "ghost"}
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={onLike}
            title="Like video"
          >
            <ThumbsUp className="h-5 w-5" />
          </Button>
          <Button
            variant={isDisliked ? "default" : "ghost"}
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={onDislike}
            title="Dislike video"
          >
            <ThumbsDown className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={onShare}
            title="Share video"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:bg-white/10"
        onClick={onDownload}
        title="Download video"
      >
        <Download className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:bg-white/10"
        onClick={onOpenOriginal}
        title="Open original"
      >
        <ExternalLink className="h-5 w-5" />
      </Button>
    </div>
  );
};
