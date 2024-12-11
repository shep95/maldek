import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Author } from "@/utils/postUtils";

interface PostHeaderProps {
  author: Author;
  timestamp: Date;
}

export const PostHeader = ({ author, timestamp }: PostHeaderProps) => {
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    
    // Less than a minute
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s`;
    }
    
    // Less than an hour
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}M`;
    }
    
    // Less than a day
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h`;
    }
    
    // Less than a week
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d`;
    }
    
    // Less than a month
    if (diffInDays < 30) {
      return `${Math.floor(diffInDays / 7)}w`;
    }
    
    // Less than a year
    if (diffInDays < 365) {
      return `${Math.floor(diffInDays / 30)}mo`;
    }
    
    // More than a year
    return `${Math.floor(diffInDays / 365)}y`;
  };

  const timeAgo = getTimeAgo(new Date(timestamp));

  return (
    <div className="flex items-start gap-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src={author.profilePicture} alt={author.name} />
        <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-baseline justify-between">
          <div>
            <h3 className="font-semibold">{author.name}</h3>
            <p className="text-sm text-muted-foreground">@{author.username}</p>
          </div>
          <span className="text-sm text-muted-foreground ml-auto">{timeAgo}</span>
        </div>
      </div>
    </div>
  );
};