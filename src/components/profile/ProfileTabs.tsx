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

  const { data: posts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ['profile-posts', userId],
    queryFn: async () => {
      console.log('Fetching posts for user:', userId);
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          media_urls,
          user_id,
          likes,
          reposts,
          profiles!inner (
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

      {["replies", "media", "videos", "likes"].map((tab) => (
        <TabsContent key={tab} value={tab} className="min-h-[400px]">
          <div className="p-4 text-center text-muted-foreground">
            <div className="p-8 rounded-lg bg-gradient-to-b from-background/50 to-background/30 backdrop-blur-sm border border-accent/10 animate-fade-in">
              No {tab} yet
            </div>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};