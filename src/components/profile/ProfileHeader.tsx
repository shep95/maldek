
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StoryRing } from "@/components/profile/StoryRing";
import { Crown, Users, PencilIcon } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import { useSession } from '@supabase/auth-helpers-react';

interface ProfileHeaderProps {
  profile: any;
  isLoading: boolean;
}

export const ProfileHeader = ({ profile, isLoading }: ProfileHeaderProps) => {
  const queryClient = useQueryClient();
  const session = useSession();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const isOwnProfile = session?.user?.id === profile?.id;

  const { data: subscription } = useQuery({
    queryKey: ['user-subscription', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      
      console.log('Fetching subscription for profile:', profile.id);
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_tiers (
            name,
            checkmark_color
          )
        `)
        .eq('user_id', profile.id)
        .eq('status', 'active')
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return null;
        }
        console.error('Error fetching subscription:', error);
        return null;
      }

      console.log('Profile subscription data:', data);
      return data;
    },
    enabled: !!profile?.id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1,
  });

  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase.channel('profile-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${profile.id}`
        },
        (payload) => {
          console.log('Profile updated:', payload);
          queryClient.invalidateQueries({ queryKey: ['profile', profile.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, queryClient]);

  const handleProfileUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['profile', profile.id] });
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-5">
            <div className="h-24 w-24 rounded-full bg-muted"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const followerCount = profile.follower_count ?? 0;

  return (
    <div className="bg-black/40 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-5">
          <div className="relative flex">
            <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl"></div>
            <StoryRing userId={profile.id}>
              <div className="relative group">
                <Avatar className="h-24 w-24 ring-4 ring-background relative z-10 shadow-xl">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback>
                    {profile.username?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isOwnProfile && (
                  <button
                    onClick={() => setIsEditProfileOpen(true)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
                  >
                    <PencilIcon className="w-6 h-6 text-white" />
                  </button>
                )}
              </div>
            </StoryRing>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
                @{profile.username}
              </h1>
              {subscription?.subscription_tiers && (
                <Crown 
                  className="h-5 w-5" 
                  style={{ 
                    color: subscription.subscription_tiers?.checkmark_color || '#FFD700'
                  }} 
                />
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Users className="w-4 h-4 text-white/60" />
              <span className="text-sm text-white/60">
                {followerCount.toLocaleString()} followers
              </span>
            </div>
            {profile.bio && (
              <p className="text-sm text-white/60 mt-1 max-w-lg">{profile.bio}</p>
            )}
            <div className="mt-4">
              <Button 
                variant="secondary" 
                className="bg-accent/10 hover:bg-accent/20 text-white border border-accent/20"
              >
                Follow
              </Button>
            </div>
          </div>
        </div>
      </div>
      <EditProfileDialog
        isOpen={isEditProfileOpen}
        onOpenChange={setIsEditProfileOpen}
        profile={profile}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  );
};
