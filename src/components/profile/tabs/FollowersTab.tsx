import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

interface FollowersTabProps {
  userId: string;
}

export const FollowersTab = ({ userId }: FollowersTabProps) => {
  const navigate = useNavigate();

  const { data: followers, isLoading } = useQuery({
    queryKey: ['followers', userId],
    queryFn: async () => {
      console.log('Fetching followers for user:', userId);
      const { data, error } = await supabase
        .from('followers')
        .select(`
          follower_id,
          profiles:profiles!followers_follower_id_fkey (
            id,
            username,
            avatar_url
          )
        `)
        .eq('following_id', userId);

      if (error) {
        console.error('Error fetching followers:', error);
        throw error;
      }
      console.log('Fetched followers:', data);
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return followers && followers.length > 0 ? (
    <div className="space-y-4">
      {followers.map((follow) => (
        <div 
          key={follow.follower_id}
          className="flex items-center space-x-4 p-4 rounded-lg hover:bg-accent/5 cursor-pointer transition-colors"
          onClick={() => navigate(`/profile/${follow.profiles.id}`)}
        >
          <Avatar className="h-12 w-12">
            <AvatarImage src={follow.profiles.avatar_url || ''} />
            <AvatarFallback>{follow.profiles.username[0]}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{follow.profiles.username}</div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center text-muted-foreground p-8">
      No followers yet
    </div>
  );
};