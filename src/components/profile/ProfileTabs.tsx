import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PostCard } from "../dashboard/PostCard";
import { useSession } from "@supabase/auth-helpers-react";
import { Skeleton } from "../ui/skeleton";

export const ProfileTabs = () => {
  const { userId } = useParams();
  const session = useSession();

  // Query for user's posts
  const { data: posts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ['profile-posts', userId],
    queryFn: async () => {
      console.log('Fetching posts for user:', userId);
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            id,
            username,
            avatar_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        throw error;
      }
      console.log('Fetched posts:', data);
      return data;
    },
    enabled: !!userId
  });

  // Query for user's replies (comments)
  const { data: replies, isLoading: isLoadingReplies } = useQuery({
    queryKey: ['profile-replies', userId],
    queryFn: async () => {
      console.log('Fetching replies for user:', userId);
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          posts (
            *,
            profiles (
              id,
              username,
              avatar_url
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching replies:', error);
        throw error;
      }
      console.log('Fetched replies:', data);
      return data;
    },
    enabled: !!userId
  });

  // Query for user's media posts
  const { data: mediaPosts, isLoading: isLoadingMedia } = useQuery({
    queryKey: ['profile-media', userId],
    queryFn: async () => {
      console.log('Fetching media posts for user:', userId);
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            id,
            username,
            avatar_url
          )
        `)
        .eq('user_id', userId)
        .not('media_urls', 'eq', '{}')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching media posts:', error);
        throw error;
      }
      console.log('Fetched media posts:', data);
      return data;
    },
    enabled: !!userId
  });

  // Query for user's videos
  const { data: videos, isLoading: isLoadingVideos } = useQuery({
    queryKey: ['profile-videos', userId],
    queryFn: async () => {
      console.log('Fetching videos for user:', userId);
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching videos:', error);
        throw error;
      }
      console.log('Fetched videos:', data);
      return data;
    },
    enabled: !!userId
  });

  // Query for user's liked posts
  const { data: likedPosts, isLoading: isLoadingLikes } = useQuery({
    queryKey: ['profile-likes', userId],
    queryFn: async () => {
      console.log('Fetching liked posts for user:', userId);
      const { data, error } = await supabase
        .from('post_likes')
        .select(`
          post_id,
          posts (
            *,
            profiles (
              id,
              username,
              avatar_url
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching liked posts:', error);
        throw error;
      }
      console.log('Fetched liked posts:', data);
      return data;
    },
    enabled: !!userId
  });

  const renderLoadingSkeleton = () => (
    <div className="space-y-6">
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

  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="w-full justify-start rounded-none border-b bg-transparent">
        {["posts", "replies", "media", "videos", "likes"].map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab}
            className={cn(
              "rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-accent hover:text-accent transition-colors duration-300 capitalize"
            )}
          >
            {tab}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="posts" className="min-h-[400px]">
        {isLoadingPosts ? (
          renderLoadingSkeleton()
        ) : posts && posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post) => (
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
                  comments: 0,
                  isLiked: false,
                  isBookmarked: false
                }}
                currentUserId={session?.user?.id || ''}
                onPostAction={() => {}}
                onMediaClick={() => {}}
              />
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            <div className="p-8 rounded-lg bg-gradient-to-b from-background/50 to-background/30 backdrop-blur-sm border border-accent/10 animate-fade-in">
              No posts yet
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="replies" className="min-h-[400px]">
        {isLoadingReplies ? (
          renderLoadingSkeleton()
        ) : replies && replies.length > 0 ? (
          <div className="space-y-6">
            {replies.map((reply) => (
              <div key={reply.id} className="p-4 rounded-lg border border-muted">
                <p className="text-muted-foreground mb-2">Replied to:</p>
                <PostCard
                  post={{
                    ...reply.posts,
                    author: {
                      id: reply.posts.profiles.id,
                      username: reply.posts.profiles.username,
                      avatar_url: reply.posts.profiles.avatar_url,
                      name: reply.posts.profiles.username
                    },
                    timestamp: new Date(reply.posts.created_at),
                    comments: 0,
                    isLiked: false,
                    isBookmarked: false
                  }}
                  currentUserId={session?.user?.id || ''}
                  onPostAction={() => {}}
                  onMediaClick={() => {}}
                />
                <div className="mt-2 p-4 bg-accent/5 rounded">
                  <p>{reply.content}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            <div className="p-8 rounded-lg bg-gradient-to-b from-background/50 to-background/30 backdrop-blur-sm border border-accent/10 animate-fade-in">
              No replies yet
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="media" className="min-h-[400px]">
        {isLoadingMedia ? (
          renderLoadingSkeleton()
        ) : mediaPosts && mediaPosts.length > 0 ? (
          <div className="space-y-6">
            {mediaPosts.map((post) => (
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
                  comments: 0,
                  isLiked: false,
                  isBookmarked: false
                }}
                currentUserId={session?.user?.id || ''}
                onPostAction={() => {}}
                onMediaClick={() => {}}
              />
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            <div className="p-8 rounded-lg bg-gradient-to-b from-background/50 to-background/30 backdrop-blur-sm border border-accent/10 animate-fade-in">
              No media posts yet
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="videos" className="min-h-[400px]">
        {isLoadingVideos ? (
          renderLoadingSkeleton()
        ) : videos && videos.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {videos.map((video) => (
              <div key={video.id} className="rounded-lg border border-muted overflow-hidden">
                <video
                  src={video.video_url}
                  poster={video.thumbnail_url}
                  controls
                  className="w-full"
                />
                <div className="p-4">
                  <h3 className="font-semibold mb-2">{video.title}</h3>
                  <p className="text-muted-foreground text-sm">{video.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            <div className="p-8 rounded-lg bg-gradient-to-b from-background/50 to-background/30 backdrop-blur-sm border border-accent/10 animate-fade-in">
              No videos yet
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="likes" className="min-h-[400px]">
        {isLoadingLikes ? (
          renderLoadingSkeleton()
        ) : likedPosts && likedPosts.length > 0 ? (
          <div className="space-y-6">
            {likedPosts.map((like) => (
              <PostCard
                key={like.post_id}
                post={{
                  ...like.posts,
                  author: {
                    id: like.posts.profiles.id,
                    username: like.posts.profiles.username,
                    avatar_url: like.posts.profiles.avatar_url,
                    name: like.posts.profiles.username
                  },
                  timestamp: new Date(like.posts.created_at),
                  comments: 0,
                  isLiked: true,
                  isBookmarked: false
                }}
                currentUserId={session?.user?.id || ''}
                onPostAction={() => {}}
                onMediaClick={() => {}}
              />
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            <div className="p-8 rounded-lg bg-gradient-to-b from-background/50 to-background/30 backdrop-blur-sm border border-accent/10 animate-fade-in">
              No liked posts yet
            </div>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};