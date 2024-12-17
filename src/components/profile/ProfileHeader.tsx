import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface ProfileHeaderProps {
  profile: any;
  isLoading: boolean;
}

export const ProfileHeader = ({ profile, isLoading }: ProfileHeaderProps) => {
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [totalLikes, setTotalLikes] = useState(0);

  useEffect(() => {
    if (!profile?.id) return;

    // Set initial values
    setFollowerCount(profile.follower_count || 0);
    setTotalLikes(profile.total_likes_received || 0);

    // Get following count
    const fetchFollowingCount = async () => {
      const { count } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', profile.id);
      setFollowingCount(count || 0);
    };
    fetchFollowingCount();

    // Subscribe to real-time updates
    const channel = supabase.channel('profile-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'followers',
          filter: `following_id=eq.${profile.id}`
        },
        () => {
          console.log('Follower count updated');
          // Refetch follower count
          supabase
            .from('profiles')
            .select('follower_count')
            .eq('id', profile.id)
            .single()
            .then(({ data }) => {
              if (data) setFollowerCount(data.follower_count);
            });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_likes',
          filter: `user_id=eq.${profile.id}`
        },
        () => {
          console.log('Likes updated');
          // Refetch total likes
          supabase
            .from('profiles')
            .select('total_likes_received')
            .eq('id', profile.id)
            .single()
            .then(({ data }) => {
              if (data) setTotalLikes(data.total_likes_received);
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-48 bg-muted rounded-lg mb-4" />
        <div className="flex items-start gap-4">
          <div className="h-24 w-24 rounded-full bg-muted" />
          <div className="space-y-2 flex-1">
            <div className="h-6 w-48 bg-muted rounded" />
            <div className="h-4 w-full max-w-md bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative h-48 bg-gradient-to-r from-black to-accent/20 overflow-hidden">
        {profile?.banner_url && (
          <img
            src={profile.banner_url}
            alt="Profile banner"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      <div className="relative px-4 pb-4 -mt-20">
        <div className="max-w-4xl mx-auto">
          <Avatar className="h-32 w-32 border-4 border-background ring-2 ring-accent absolute -mt-16">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback className="text-2xl">{profile?.username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="pt-20 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">@{profile?.username}</h1>
                <p className="text-muted-foreground">
                  Joined {profile?.created_at && formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
                </p>
              </div>
              <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-white">
                Edit Profile
              </Button>
            </div>

            <p className="text-lg">{profile?.bio || 'No bio yet'}</p>

            <div className="flex gap-6 text-sm text-muted-foreground">
              <span>{followerCount} followers</span>
              <span>{followingCount} following</span>
              <span>{profile?.total_posts || 0} posts</span>
              <span>{totalLikes} likes received</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};