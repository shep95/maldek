
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StoryRing } from "@/components/profile/StoryRing";
import { Crown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProfileHeaderProps {
  profile: any;
  isLoading: boolean;
}

export const ProfileHeader = ({ profile, isLoading }: ProfileHeaderProps) => {
  // Fetch user's subscription status
  const { data: subscription } = useQuery({
    queryKey: ['user-subscription', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*, subscription_tiers(name, checkmark_color)')
        .eq('user_id', profile.id)
        .eq('status', 'active')
        .single();

      if (error) {
        console.error('Error fetching subscription:', error);
        return null;
      }
      return data;
    },
    enabled: !!profile?.id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-muted"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="-mt-16 sm:-mt-20 sm:flex sm:items-end sm:space-x-5">
            <div className="h-24 w-24 rounded-full bg-muted"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div>
      <div className="h-32 bg-gradient-to-r from-orange-400 to-orange-600">
        {profile.banner_url && (
          <img
            src={profile.banner_url}
            alt=""
            className="h-32 w-full object-cover"
          />
        )}
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="-mt-16 sm:-mt-20 sm:flex sm:items-end sm:space-x-5">
          <div className="relative flex">
            <StoryRing userId={profile.id}>
              <Avatar className="h-24 w-24 ring-4 ring-background">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback>
                  {profile.username?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </StoryRing>
          </div>
          <div className="mt-6 sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
            <div className="sm:hidden md:block mt-6 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  @{profile.username}
                </h1>
                {subscription && (
                  <Crown 
                    className="h-5 w-5" 
                    style={{ 
                      color: subscription.subscription_tiers?.checkmark_color || '#FFD700'
                    }} 
                  />
                )}
              </div>
              {profile.bio && (
                <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>
              )}
            </div>
            <div className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
              <Button variant="secondary">Follow</Button>
              <Button variant="outline">Share Profile</Button>
            </div>
          </div>
        </div>
        <div className="hidden sm:block md:hidden mt-6 min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900 truncate">
            @{profile.username}
          </h1>
        </div>
      </div>
    </div>
  );
};
