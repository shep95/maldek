
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PostList } from "@/components/dashboard/PostList";
import { useSession } from "@supabase/auth-helpers-react";
import { Hash } from "lucide-react";

const HashtagPage = () => {
  const { hashtag } = useParams<{ hashtag: string }>();
  const session = useSession();
  
  const { data: hashtagPosts, isLoading } = useQuery({
    queryKey: ['hashtag-posts', hashtag],
    queryFn: async () => {
      console.log(`Fetching posts for hashtag: #${hashtag}`);
      
      // First find the hashtag ID
      const { data: hashtagData, error: hashtagError } = await supabase
        .from('hashtags')
        .select('id')
        .eq('name', hashtag)
        .single();
        
      if (hashtagError) {
        console.error("Error finding hashtag:", hashtagError);
        return [];
      }
      
      if (!hashtagData) {
        console.log("Hashtag not found");
        return [];
      }
      
      // Get posts with this hashtag
      const { data: postHashtags, error: postHashtagError } = await supabase
        .from('post_hashtags')
        .select('post_id')
        .eq('hashtag_id', hashtagData.id);
        
      if (postHashtagError) {
        console.error("Error finding posts with hashtag:", postHashtagError);
        return [];
      }
      
      if (!postHashtags || postHashtags.length === 0) {
        console.log("No posts found with this hashtag");
        return [];
      }
      
      const postIds = postHashtags.map(item => item.post_id);
      
      // Get the actual posts
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            id,
            username,
            avatar_url,
            user_subscriptions (
              status,
              subscription_tiers (
                name,
                checkmark_color
              )
            )
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
        .in('id', postIds)
        .order('created_at', { ascending: false });
        
      if (postsError) {
        console.error("Error fetching hashtag posts:", postsError);
        return [];
      }
      
      // Format the posts in the same way as in usePosts
      const formattedPosts = posts?.map(post => {
        const subscriptions = Array.isArray(post.profiles.user_subscriptions) 
          ? post.profiles.user_subscriptions 
          : [];
            
        const activeSubscription = subscriptions.find(
          sub => sub?.status === 'active'
        );

        const likeCount = post.post_likes ? post.post_likes.length : 0;

        return {
          ...post,
          author: {
            id: post.profiles.id,
            username: post.profiles.username || 'Deleted User',
            avatar_url: post.profiles.avatar_url,
            name: post.profiles.username || 'Deleted User',
            subscription: activeSubscription?.subscription_tiers || null
          },
          likes: likeCount
        };
      });
      
      return formattedPosts || [];
    },
    enabled: !!hashtag
  });

  const handlePostAction = (postId: string, action: string) => {
    console.log(`Handling ${action} for post ${postId}`);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <div className="flex items-center gap-3 py-6 border-b">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
          <Hash className="h-6 w-6 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">#{hashtag}</h1>
          <p className="text-muted-foreground">
            {hashtagPosts?.length || 0} {hashtagPosts?.length === 1 ? 'post' : 'posts'}
          </p>
        </div>
      </div>
      
      <div className="py-4">
        <PostList 
          posts={hashtagPosts || []}
          isLoading={isLoading}
          currentUserId={session?.user?.id || ''}
          onPostAction={handlePostAction}
        />
        
        {!isLoading && (!hashtagPosts || hashtagPosts.length === 0) && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Hash className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2">No posts found</h2>
            <p className="text-muted-foreground">
              Be the first to post with #{hashtag}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HashtagPage;
