
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Edit2 } from "lucide-react";
import type { Author } from "@/utils/postUtils";

interface PostHeaderProps {
  author: Author;
  timestamp: Date;
  onUsernameClick: (e: React.MouseEvent) => void;
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
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={author.avatar_url || undefined} />
          <AvatarFallback>{author.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-1">
            <button
              onClick={onUsernameClick}
              className="font-semibold hover:underline"
            >
              @{author.username}
            </button>
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
