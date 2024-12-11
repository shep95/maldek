import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Heart, MessageSquare, Share2, Bookmark, Maximize, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Author {
  id: string;
  name: string;
  username: string;
  profilePicture?: string;
}

interface Post {
  id: string;
  content: string;
  timestamp: Date;
  mentions?: string[];
  mediaUrls?: string[];
  likes: number;
  comments: number;
  reposts: number;
  isLiked: boolean;
  isBookmarked: boolean;
  authorId: string;
  author: Author;
}

interface PostCardProps {
  post: Post;
  currentUserId: string;
  onPostAction: (postId: string, action: 'like' | 'bookmark' | 'delete' | 'repost') => void;
  onMediaClick: (url: string) => void;
}

export const PostCard = ({ post, currentUserId, onPostAction, onMediaClick }: PostCardProps) => {
  const timeAgo = formatDistanceToNow(new Date(post.timestamp), { addSuffix: true });
  
  const isVideoFile = (url: string) => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
    return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
  };

  return (
    <Card className="border border-muted bg-card/50 backdrop-blur-sm p-6">
      <div className="flex items-start gap-3 mb-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={post.author.profilePicture} alt={post.author.name} />
          <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-baseline justify-between">
            <div>
              <h3 className="font-semibold">{post.author.name}</h3>
              <p className="text-sm text-muted-foreground">@{post.author.username}</p>
            </div>
            <span className="text-sm text-muted-foreground">{timeAgo}</span>
          </div>
        </div>
      </div>

      <p className="text-foreground whitespace-pre-wrap mb-4">{post.content}</p>

      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="mt-4 grid gap-2 grid-cols-1 sm:grid-cols-2">
          {post.mediaUrls.map((url, i) => (
            <div key={i} className="relative rounded-lg overflow-hidden">
              {isVideoFile(url) ? (
                <AspectRatio ratio={16 / 9}>
                  <video
                    src={url}
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover rounded-lg"
                    style={{ borderRadius: '0.5rem' }}
                  />
                </AspectRatio>
              ) : (
                <div 
                  className="cursor-pointer" 
                  onClick={() => onMediaClick(url)}
                >
                  <AspectRatio ratio={16 / 9}>
                    <img
                      src={url}
                      alt={`Post media ${i + 1}`}
                      className="w-full h-full object-cover rounded-lg hover:opacity-90 transition-opacity"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
                    >
                      <Maximize className="h-4 w-4 text-white" />
                    </Button>
                  </AspectRatio>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-4">
          <Button
            variant="ghost"
            size="sm"
            className={`gap-2 ${post.isLiked ? 'text-red-500' : ''}`}
            onClick={() => onPostAction(post.id, 'like')}
          >
            <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
            {post.likes}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            {post.comments}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => onPostAction(post.id, 'repost')}
          >
            <Share2 className="h-4 w-4" />
            {post.reposts}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`gap-2 ${post.isBookmarked ? 'text-blue-500' : ''}`}
            onClick={() => onPostAction(post.id, 'bookmark')}
          >
            <Bookmark className={`h-4 w-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
          </Button>
        </div>
        {post.authorId === currentUserId && (
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600"
            onClick={() => onPostAction(post.id, 'delete')}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  );
};