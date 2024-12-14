import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

interface SearchResultsProps {
  isLoading: boolean;
  results?: Array<{
    id: string;
    username: string;
    avatar_url: string | null;
  }>;
}

export const SearchResults = ({ isLoading, results }: SearchResultsProps) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-muted rounded-md" />
        ))}
      </div>
    );
  }

  if (!results || results.length === 0) {
    return <p className="text-muted-foreground">No results found</p>;
  }

  return (
    <div className="space-y-2">
      {results.map((user) => (
        <div 
          key={user.id} 
          className="flex items-center gap-3 p-2 hover:bg-accent/10 rounded-md cursor-pointer"
          onClick={() => navigate(`/${user.username}`)}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar_url || ''} />
            <AvatarFallback>{user.username[0]}</AvatarFallback>
          </Avatar>
          <span>@{user.username}</span>
        </div>
      ))}
    </div>
  );
};