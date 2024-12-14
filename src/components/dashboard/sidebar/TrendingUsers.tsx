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

  const handleUserClick = (username: string) => {
    console.log("Navigating to profile:", username);
    // Navigate without replace to allow back navigation
    navigate(`/${username}`);
  };

  const handleFollowUser = async (e: React.MouseEvent, userId: string) => {
    e.stopPropagation(); // Prevent the parent click from firing
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

  if (!users || users.length === 0) {
    return <p className="text-muted-foreground">No trending users yet</p>;
  }

  return (
    <div className="space-y-2">
      {users.map((user) => (
        <div 
          key={user.id} 
          className="flex justify-between items-center hover:bg-accent/10 p-2 rounded-md transition-colors cursor-pointer"
          onClick={() => handleUserClick(user.username)}
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar_url || ''} />
              <AvatarFallback>{user.username[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">@{user.username}</span>
              <span className="text-sm text-muted-foreground">{user.follower_count} followers</span>
            </div>
          </div>
          {session?.user?.id !== user.id && (
            <Button 
              variant="outline" 
              size="sm"
              className="ml-2 hover:bg-accent hover:text-white"
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