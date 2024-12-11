import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Author } from "@/utils/postUtils";

interface PostHeaderProps {
  author: Author;
  timestamp: Date;
}

export const PostHeader = ({ author, timestamp }: PostHeaderProps) => {
  const timeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true });

  return (
    <div className="flex items-start gap-3 mb-4">
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
          <span className="text-sm text-muted-foreground">{timeAgo}</span>
        </div>
      </div>
    </div>
  );
};