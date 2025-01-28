import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

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
  const handlePostClick = (postId: string) => {
    console.log('Scrolling to post:', postId);
    const postElement = document.getElementById(`post-${postId}`);
    if (postElement) {
      postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add a highlight effect
      postElement.classList.add('ring-2', 'ring-accent', 'ring-offset-2');
      setTimeout(() => {
        postElement.classList.remove('ring-2', 'ring-accent', 'ring-offset-2');
      }, 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-3 p-3 rounded-lg bg-muted/5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-muted-foreground text-center p-4 rounded-lg bg-muted/5">
        No trending posts yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div 
          key={post.id} 
          onClick={() => handlePostClick(post.id)}
          className="group hover:bg-accent/5 p-3 rounded-lg transition-all duration-200 cursor-pointer border border-transparent hover:border-accent/10 backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-6 w-6 ring-2 ring-background">
              <AvatarImage src={post.profiles.avatar_url || ''} />
              <AvatarFallback>{post.profiles.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium group-hover:text-accent transition-colors">
              @{post.profiles.username}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 group-hover:text-foreground transition-colors">
            {post.content}
          </p>
          <div className="text-xs text-muted-foreground mt-2 opacity-80">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </div>
        </div>
      ))}
    </div>
  );
};