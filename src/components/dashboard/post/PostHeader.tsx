import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Author } from "@/utils/postUtils";
import { Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface PostHeaderProps {
  author: Author;
  timestamp: Date;
  onUsernameClick: (e: React.MouseEvent) => void;
}

export const PostHeader = ({ author, timestamp, onUsernameClick }: PostHeaderProps) => {
  const navigate = useNavigate();
  
  const { data: subscription } = useQuery({
    queryKey: ['user-subscription', author.id],
    queryFn: async () => {
      try {
        console.log('Fetching subscription for user:', author.id);
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .select(`
            *,
            tier:subscription_tiers(*)
          `)
          .eq('user_id', author.id)
          .eq('status', 'active')
          .maybeSingle();

        if (subscriptionError) {
          console.error('Error fetching subscription:', subscriptionError);
          return null;
        }

        if (!subscriptionData) {
          console.log('No active subscription found for user');
          return null;
        }

        console.log('Subscription data:', subscriptionData);
        return subscriptionData;
      } catch (error) {
        console.error('Error in subscription query:', error);
        return null;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Navigating to profile:', author.username);
    navigate(`/@${author.username}`);
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}M`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}mo`;
    return `${Math.floor(diffInDays / 365)}y`;
  };

  const timeAgo = getTimeAgo(new Date(timestamp));

  return (
    <div className="flex items-start gap-3">
      <Avatar 
        className="h-10 w-10 cursor-pointer" 
        onClick={handleProfileClick}
      >
        <AvatarImage src={author.avatar_url || ''} alt={author.name} />
        <AvatarFallback>{author.name?.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={handleProfileClick}
              className="font-semibold hover:underline"
            >
              {author.name}
            </button>
            {subscription?.tier?.name === 'Creator' && (
              <div className="group relative">
                <div className="h-6 w-6 rounded-full flex items-center justify-center shadow-[0_0_12px_rgba(249,115,22,0.6)] border-2 border-orange-500 bg-black/50 backdrop-blur-sm">
                  <Check className="h-4 w-4 text-orange-500 stroke-[3]" />
                </div>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-background/90 backdrop-blur-sm text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap border border-border">
                  Creator
                </div>
              </div>
            )}
            {subscription?.tier?.name === 'Business' && (
              <div className="group relative">
                <div className="h-6 w-6 rounded-full flex items-center justify-center shadow-[0_0_12px_rgba(234,179,8,0.6)] border-2 border-yellow-500 bg-black/50 backdrop-blur-sm">
                  <Check className="h-4 w-4 text-yellow-500 stroke-[3]" />
                </div>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-background/90 backdrop-blur-sm text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap border border-border">
                  Business
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleProfileClick}
            className="text-sm text-muted-foreground hover:underline"
          >
            @{author.username}
          </button>
        </div>
      </div>
      <span className="text-sm text-muted-foreground">{timeAgo}</span>
    </div>
  );
};