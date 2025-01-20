import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from 'date-fns';
import { Author } from "@/utils/postUtils";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PostHeaderProps {
  author: Author;
  timestamp: Date;
  onDelete?: () => void;
  currentUserId?: string;
  onUsernameClick?: (e: React.MouseEvent) => void;
}

export const PostHeader = ({ author, timestamp, onDelete, currentUserId, onUsernameClick }: PostHeaderProps) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    console.log('Profile click debug:');
    console.log('1. Author:', author);
    console.log('2. Username:', author.username);
    console.log('3. Current path:', window.location.pathname);
    
    // Remove any existing @ symbol and ensure we have the correct format
    const cleanUsername = author.username.replace(/^@/, '');
    const profilePath = `/@${cleanUsername}`;
    console.log('4. Target path:', profilePath);
    
    navigate(profilePath);
  };

  const getTimeAgo = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div className="flex items-start justify-between">
      <div className="flex items-start space-x-3">
        <Avatar 
          className="h-10 w-10 cursor-pointer border-2 border-background hover:border-accent/50 transition-all"
          onClick={handleProfileClick}
        >
          <AvatarImage src={author.avatar_url || ''} />
          <AvatarFallback>{author.username[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <button
              onClick={onUsernameClick || handleProfileClick}
              className="font-semibold hover:underline"
            >
              @{author.username}
            </button>
            <span className="text-muted-foreground text-sm">·</span>
            <span className="text-muted-foreground text-sm">
              {getTimeAgo(timestamp)}
            </span>
          </div>
        </div>
      </div>

      {onDelete && currentUserId === author.id && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={onDelete}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};