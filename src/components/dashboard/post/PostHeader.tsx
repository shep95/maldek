
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Edit2, Crown, ArrowLeft } from "lucide-react";
import type { Author } from "@/utils/postUtils";
import { useProfileNavigation } from "@/hooks/useProfileNavigation";

interface PostHeaderProps {
  author: Author;
  timestamp: Date;
  onUsernameClick?: (e: React.MouseEvent) => void;
  canEdit?: boolean;
  isEditing?: boolean;
  onEditClick?: () => void;
}

export const PostHeader = ({ 
  author, 
  timestamp, 
  onUsernameClick,
  canEdit,
  isEditing,
  onEditClick 
}: PostHeaderProps) => {
  const { navigateToProfile } = useProfileNavigation();

  const handleUsernameClick = (e: React.MouseEvent) => {
    if (onUsernameClick) {
      onUsernameClick(e);
    } else {
      navigateToProfile(author.username, e);
    }
  };

  const handleAvatarClick = (e: React.MouseEvent) => {
    navigateToProfile(author.username, e);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar 
          className="h-10 w-10 cursor-pointer hover:border-accent transition-colors duration-200"
          onClick={handleAvatarClick}
        >
          <AvatarImage src={author.avatar_url || undefined} />
          <AvatarFallback>{author.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleUsernameClick}
              className="font-semibold hover:underline hover:text-accent transition-colors"
            >
              @{author.username}
            </button>
            {author.subscription && (
              <Crown 
                className="h-4 w-4" 
                style={{ 
                  color: author.subscription.checkmark_color || '#FFD700'
                }} 
              />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {formatDistanceToNow(timestamp, { addSuffix: true })}
          </p>
        </div>
      </div>
      {canEdit && !isEditing && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onEditClick?.();
          }}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
