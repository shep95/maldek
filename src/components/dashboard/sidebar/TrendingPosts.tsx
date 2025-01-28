import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface TrendingPostsProps {
  isLoading: boolean;
  posts?: Array<{
    id: string;
    content: string;
    created_at: string;
    engagement_score: number;
    profiles: {
      username: string;
      avatar_url: string | null;
    };
  }>;
}

export const TrendingPosts = ({ isLoading, posts }: TrendingPostsProps) => {
  const navigate = useNavigate();

  const handlePostClick = (postId: string) => {
    console.log('Navigating to post:', postId);
    navigate(`/post/${postId}`);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-muted rounded-md" />
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return <p className="text-muted-foreground">No trending posts yet</p>;
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div 
          key={post.id} 
          className="hover:bg-accent/10 p-3 rounded-lg transition-colors cursor-pointer"
          onClick={() => handlePostClick(post.id)}
        >
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={post.profiles.avatar_url || ''} />
              <AvatarFallback>{post.profiles.username[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">@{post.profiles.username}</span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
          <div className="text-xs text-muted-foreground mt-2">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </div>
        </div>
      ))}
    </div>
  );
};