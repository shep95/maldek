import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommentHeaderProps {
  user: {
    username: string;
    avatar_url: string | null;
  };
  timestamp: string;
  onProfileClick: (e: React.MouseEvent) => void;
}

export const CommentHeader = ({ user, timestamp, onProfileClick }: CommentHeaderProps) => {
  const { data: subscription } = useQuery({
    queryKey: ['user-subscription', user.username],
    queryFn: async () => {
      console.log('Fetching subscription data for:', user.username);
      
      // First get the user's profile ID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', user.username)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return null;
      }

      if (!profile) {
        console.log('No profile found for username:', user.username);
        return null;
      }

      console.log('Found profile:', profile);

      // Then get their subscription data
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          tier:subscription_tiers(*)
        `)
        .eq('user_id', profile.id)
        .eq('status', 'active')
        .maybeSingle();

      if (subscriptionError) {
        console.error('Subscription Query Error:', subscriptionError);
        return null;
      }

      console.log('Subscription data:', subscriptionData);
      return subscriptionData;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const handleClick = (e: React.MouseEvent) => {
    console.log('CommentHeader - Profile click handler called');
    e.preventDefault();
    e.stopPropagation();
    onProfileClick(e);
  };

  return (
    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={handleClick}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatar_url || undefined} />
          <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
      </button>
      
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={handleClick}
              className="font-semibold cursor-pointer hover:underline"
            >
              @{user.username}
            </button>
            {subscription?.tier?.name && (
              <div className="group relative">
                <div className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center",
                  "border-2 bg-black/50 backdrop-blur-sm",
                  subscription.tier.name === 'True Emperor' && "border-yellow-500",
                  subscription.tier.name === 'Creator' && "border-orange-500",
                  subscription.tier.name === 'Business' && "border-purple-500"
                )}>
                  <Crown className={cn(
                    "h-4 w-4",
                    subscription.tier.name === 'True Emperor' && "text-yellow-500",
                    subscription.tier.name === 'Creator' && "text-orange-500",
                    subscription.tier.name === 'Business' && "text-purple-500"
                  )} />
                </div>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-background/90 backdrop-blur-sm text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap border border-border">
                  {subscription.tier.name}
                </div>
              </div>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {new Date(timestamp).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};