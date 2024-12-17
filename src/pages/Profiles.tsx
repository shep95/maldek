import { useQuery } from "@tanstack/react-query";
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/dashboard/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { formatDistanceToNow } from 'date-fns';

const Profiles = () => {
  const session = useSession();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      console.log('Fetching user profile...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session?.user?.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
        throw error;
      }

      console.log('Profile fetched:', data);
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['user-posts', session?.user?.id],
    queryFn: async () => {
      console.log('Fetching user posts...');
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            id,
            username,
            avatar_url
          ),
          post_likes (
            id,
            user_id
          ),
          bookmarks (
            id,
            user_id
          ),
          comments (
            id
          )
        `)
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        toast.error('Failed to load posts');
        throw error;
      }

      console.log('Posts fetched:', data);
      return data;
    },
    enabled: !!session?.user?.id,
  });

  if (profileLoading || postsLoading) {
    return (
      <div className="space-y-8 p-4">
        <div className="animate-pulse">
          <div className="h-48 bg-muted rounded-lg mb-4" /> {/* Banner */}
          <div className="flex items-start gap-4">
            <Skeleton className="h-24 w-24 rounded-full" /> {/* Avatar */}
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-48" /> {/* Username */}
              <Skeleton className="h-4 w-full max-w-md" /> {/* Bio */}
            </div>
          </div>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 rounded-lg border border-muted bg-card/50 backdrop-blur-sm space-y-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!profile) return null;

  const handlePostAction = async (postId: string, action: 'like' | 'bookmark' | 'delete' | 'repost') => {
    try {
      if (action === 'delete') {
        const { error } = await supabase
          .from('posts')
          .delete()
          .eq('id', postId);

        if (error) throw error;
        toast.success('Post deleted successfully');
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      toast.error(`Failed to ${action} post`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="relative h-48 bg-gradient-to-r from-black to-accent/20 overflow-hidden">
        {profile.banner_url && (
          <img
            src={profile.banner_url}
            alt="Profile banner"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      {/* Profile Info */}
      <div className="relative px-4 pb-4 -mt-20">
        <div className="max-w-4xl mx-auto">
          <Avatar className="h-32 w-32 border-4 border-background ring-2 ring-accent absolute -mt-16">
            <AvatarImage src={profile.avatar_url || ''} />
            <AvatarFallback className="text-2xl">{profile.username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="pt-20 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">@{profile.username}</h1>
                <p className="text-muted-foreground">
                  Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
                </p>
              </div>
              <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-white">
                Edit Profile
              </Button>
            </div>

            <p className="text-lg">{profile.bio || 'No bio yet'}</p>

            <div className="flex gap-6 text-sm text-muted-foreground">
              <span>{profile.follower_count} followers</span>
              <span>{posts?.length || 0} posts</span>
              <span>{profile.total_likes_received || 0} likes</span>
            </div>
          </div>

          {/* Posts */}
          <div className="mt-8 space-y-6">
            {posts?.map((post) => (
              <PostCard
                key={post.id}
                post={{
                  ...post,
                  author: {
                    id: post.profiles.id,
                    username: post.profiles.username,
                    avatar_url: post.profiles.avatar_url,
                    name: post.profiles.username
                  },
                  timestamp: new Date(post.created_at),
                  comments: post.comments?.length || 0,
                  isLiked: post.post_likes?.some(like => like.user_id === session?.user?.id) || false,
                  isBookmarked: post.bookmarks?.some(bookmark => bookmark.user_id === session?.user?.id) || false
                }}
                currentUserId={session?.user?.id || ''}
                onPostAction={handlePostAction}
                onMediaClick={() => {}}
              />
            ))}

            {posts?.length === 0 && (
              <div className="text-center py-12 bg-card/50 backdrop-blur-sm rounded-lg border border-muted">
                <h3 className="text-lg font-medium text-foreground mb-2">No posts yet</h3>
                <p className="text-muted-foreground">
                  When you create posts, they'll show up here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profiles;