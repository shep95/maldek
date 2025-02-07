
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
      <div className="animate-pulse space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 bg-muted rounded-md" />
        ))}
      </div>
    );
  }

  // Featured users that should always be shown
  const featuredUsers = [
    {
      id: "featured-1",
      username: "KillerBattleAsher",
      email: "Killerbattleasher@gmail.com",
      avatar_url: null,
      follower_count: 100000
    },
    {
      id: "featured-2",
      username: "NFTDEMON",
      avatar_url: null,
      follower_count: 50000
    },
    ...(users || []).filter(user => 
      user.username !== "KillerBattleAsher" && 
      user.username !== "NFTDEMON"
    ).slice(0, 3) // Show up to 3 additional trending users
  ];

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-lg mb-4">Trending Users</h3>
      {featuredUsers.map((user) => (
        <div 
          key={user.id} 
          className="flex justify-between items-center hover:bg-accent/10 p-2 rounded-md transition-colors relative"
        >
          <div 
            className="flex items-center gap-3 cursor-pointer flex-grow min-w-0"
            onClick={(e) => handleUserClick(e, user.username)}
          >
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={user.avatar_url || ''} />
              <AvatarFallback>{user.username[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="font-medium truncate">@{user.username}</span>
              <span className="text-sm text-muted-foreground truncate">{user.follower_count.toLocaleString()} followers</span>
            </div>
          </div>
          {session?.user?.id !== user.id && (
            <Button 
              variant="outline" 
              size="sm"
              className="ml-2 hover:bg-accent hover:text-accent-foreground flex-shrink-0"
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
