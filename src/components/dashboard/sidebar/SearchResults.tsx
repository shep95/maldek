
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Hash } from "lucide-react";

interface SearchResultsProps {
  isLoading: boolean;
  results?: {
    users: Array<{
      id: string;
      username: string;
      avatar_url: string | null;
      follower_count?: number;
      total_posts?: number;
      bio?: string;
    }>;
    posts: Array<{
      id: string;
      content: string;
      created_at: string;
      profiles: {
        username: string;
        avatar_url: string | null;
      };
    }>;
    hashtags?: Array<{
      id: string;
      name: string;
      post_count: number;
    }>;
  };
}

export const SearchResults = ({ isLoading, results }: SearchResultsProps) => {
  const navigate = useNavigate();

  const handleUserClick = (username: string) => {
    console.log('Navigating to user profile:', username);
    navigate(`/@${username}`);
  };

  const handlePostClick = (postId: string) => {
    console.log('Navigating to post:', postId);
    navigate(`/post/${postId}`);
  };

  const handleHashtagClick = (hashtag: string) => {
    console.log('Navigating to hashtag:', hashtag);
    navigate(`/hashtag/${hashtag}`);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-muted rounded-md" />
        ))}
      </div>
    );
  }

  if (!results || (
    results.users.length === 0 && 
    results.posts.length === 0 && 
    (!results.hashtags || results.hashtags.length === 0)
  )) {
    return <p className="text-muted-foreground">No results found</p>;
  }

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
      {results.hashtags && results.hashtags.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Hashtags</h4>
          {results.hashtags.map((hashtag) => (
            <div 
              key={hashtag.id} 
              className="flex items-center gap-2 p-3 hover:bg-accent/10 rounded-md cursor-pointer transition-colors"
              onClick={() => handleHashtagClick(hashtag.name)}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10">
                <Hash className="h-4 w-4 text-accent" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium">#{hashtag.name}</span>
                <span className="text-xs text-muted-foreground">
                  {hashtag.post_count} {hashtag.post_count === 1 ? 'post' : 'posts'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {results.users.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Users</h4>
          {results.users.map((user) => (
            <div 
              key={user.id} 
              className="flex flex-col gap-2 p-3 hover:bg-accent/10 rounded-md cursor-pointer transition-colors"
              onClick={() => handleUserClick(user.username)}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-border/50">
                  <AvatarImage src={user.avatar_url || ''} />
                  <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">@{user.username}</span>
                  {user.follower_count !== undefined && (
                    <span className="text-sm text-muted-foreground">
                      {user.follower_count} followers • {user.total_posts || 0} posts
                    </span>
                  )}
                </div>
              </div>
              {user.bio && (
                <p className="text-sm text-muted-foreground line-clamp-2">{user.bio}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {results.posts.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Posts</h4>
          {results.posts.map((post) => (
            <div 
              key={post.id} 
              className="p-3 hover:bg-accent/10 rounded-md cursor-pointer transition-colors"
              onClick={() => handlePostClick(post.id)}
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6 border border-border/50">
                  <AvatarImage src={post.profiles.avatar_url || ''} />
                  <AvatarFallback>{post.profiles.username[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm">@{post.profiles.username}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm mt-2 line-clamp-2">{post.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
