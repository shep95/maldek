import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface SearchResultsProps {
  isLoading: boolean;
  results?: {
    users: Array<{
      id: string;
      username: string;
      avatar_url: string | null;
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

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-muted rounded-md" />
        ))}
      </div>
    );
  }

  if (!results || (results.users.length === 0 && results.posts.length === 0)) {
    return <p className="text-muted-foreground">No results found</p>;
  }

  return (
    <div className="space-y-4">
      {results.users.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Users</h4>
          {results.users.map((user) => (
            <div 
              key={user.id} 
              className="flex items-center gap-3 p-2 hover:bg-accent/10 rounded-md cursor-pointer"
              onClick={() => handleUserClick(user.username)}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar_url || ''} />
                <AvatarFallback>{user.username[0]}</AvatarFallback>
              </Avatar>
              <span>@{user.username}</span>
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
              className="p-2 hover:bg-accent/10 rounded-md cursor-pointer space-y-1"
              onClick={() => handlePostClick(post.id)}
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={post.profiles.avatar_url || ''} />
                  <AvatarFallback>{post.profiles.username[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm">@{post.profiles.username}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm truncate">{post.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};