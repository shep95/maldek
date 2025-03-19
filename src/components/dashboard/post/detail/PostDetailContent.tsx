
import { Card } from "@/components/ui/card";
import { PostHeader } from "../PostHeader";
import { PostMedia } from "../PostMedia";
import { PostActions } from "../PostActions";
import { useNavigate } from "react-router-dom";
import { Post } from "@/utils/postUtils";
import { PostContent } from "../PostContent";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { useState, useEffect } from "react";
import { useUserSettings } from "@/hooks/useUserSettings";

interface PostDetailContentProps {
  post: Post;
  currentUserId: string;
  onPostAction: (postId: string, action: 'like' | 'bookmark' | 'delete' | 'repost') => void;
}

export const PostDetailContent = ({ 
  post, 
  currentUserId,
  onPostAction 
}: PostDetailContentProps) => {
  const navigate = useNavigate();
  const session = useSession();
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const { data: userSettings } = useUserSettings();

  // Get subscription for carousel component
  const { data: subscription } = useQuery({
    queryKey: ['user-subscription', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      console.log('Fetching subscription for user:', session.user.id);
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          tier:subscription_tiers (*)
        `)
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .maybeSingle();
        
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  const handleUsernameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const username = post.author.username;
    console.log("Navigating to user profile:", username);
    navigate(`/@${username}`);
  };

  const handleMediaClick = (url: string) => {
    setSelectedMedia(url);
  };

  // Force re-rendering of media component when post changes
  const [mediaKey, setMediaKey] = useState(Date.now());
  useEffect(() => {
    if (post?.id) {
      setMediaKey(Date.now());
    }
  }, [post?.id]);

  console.log("Post data in PostDetailContent:", {
    id: post.id,
    media_urls: post.media_urls,
    is_edited: post.is_edited,
    original_content: post.original_content,
    has_audio: post.has_audio
  });

  return (
    <Card className="mb-6 p-6">
      <PostHeader 
        author={post.author}
        timestamp={post.timestamp}
        onUsernameClick={handleUsernameClick}
      />
      <div className="mt-4">
        <PostContent 
          content={post.content} 
          userLanguage={userSettings?.preferred_language || 'en'}
          isEditing={false}
          truncate={false} 
          isEdited={post.is_edited || false}
          originalContent={post.original_content || null}
        />
      </div>
      {post.media_urls && post.media_urls.length > 0 && (
        <div key={mediaKey}>
          <PostMedia 
            mediaUrls={post.media_urls} 
            onMediaClick={handleMediaClick}
            subscription={subscription}
          />
        </div>
      )}
      <PostActions
        post={post}
        currentUserId={currentUserId}
        onAction={onPostAction}
      />
    </Card>
  );
};
