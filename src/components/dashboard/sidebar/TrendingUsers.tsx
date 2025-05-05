
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Flame } from "lucide-react";

interface TrendingUsersProps {
  isLoading: boolean;
  users?: Array<{
    id: string;
    username: string;
    avatar_url: string | null;
    follower_count: number;
  }>;
}

export const TrendingUsers = ({ isLoading, users }: TrendingUsersProps) => {
  const navigate = useNavigate();
  const session = useSession();

  const handleUserClick = (e: React.MouseEvent, username: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Navigating to profile:', username);
    const cleanUsername = username.startsWith('@') ? username : `@${username}`;
    navigate(cleanUsername);
  };

  const handleFollowUser = async (e: React.MouseEvent, userId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (!session?.user?.id) {
        toast.error("Please sign in to follow users");
        return;
      }

      console.log("Following user:", userId);
      const { error } = await supabase
        .from('followers')
        .insert({
          follower_id: session.user.id,
          following_id: userId
        });

      if (error) {
        if (error.code === '23505') {
          toast.error("You are already following this user");
          return;
        }
        console.error("Follow error:", error);
        throw error;
      }

      toast.success("Successfully followed user");
    } catch (error) {
      console.error("Error following user:", error);
      toast.error("Failed to follow user");
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 bg-black/40 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!users || users.length === 0) {
    return <p className="text-muted-foreground text-center py-3">No trending users yet</p>;
  }

  return (
    <div className="space-y-2.5">
      {users.map((user) => (
        <div 
          key={user.id} 
          className="group flex justify-between items-center hover:bg-black/30 p-2.5 rounded-lg transition-all duration-200 backdrop-blur-sm border border-transparent hover:border-accent/10 relative overflow-hidden"
        >
          <div 
            className="flex items-center gap-3 cursor-pointer flex-grow min-w-0"
            onClick={(e) => handleUserClick(e, user.username)}
          >
            {/* Subtle glow behind avatar */}
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-16 h-16 bg-accent/10 rounded-full blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
            
            <Avatar className="h-9 w-9 ring-2 ring-accent/20 group-hover:ring-accent/40 transition-all duration-300 flex-shrink-0">
              <AvatarImage src={user.avatar_url || ''} className="object-cover" />
              <AvatarFallback className="bg-black/30 text-accent">{user.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-medium text-sm truncate group-hover:text-accent transition-colors">@{user.username}</span>
                <Flame className="h-3 w-3 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-xs text-muted-foreground truncate">{user.follower_count} followers</span>
            </div>
          </div>
          {session?.user?.id !== user.id && (
            <Button 
              variant="outline" 
              size="sm"
              className="ml-2 bg-transparent border border-accent/30 hover:bg-accent/20 hover:border-accent text-white hover:text-white flex-shrink-0 w-[70px] h-7 text-xs transition-all opacity-0 group-hover:opacity-100"
              onClick={(e) => handleFollowUser(e, user.id)}
            >
              Follow
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};
