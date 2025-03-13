
import { Card } from "@/components/ui/card";
import { PostHeader } from "../PostHeader";
import { PostMedia } from "../PostMedia";
import { PostActions } from "../PostActions";
import { useNavigate } from "react-router-dom";
import { Post } from "@/utils/postUtils";
import { PostText } from "../content/PostText";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { useState } from "react";

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

  console.log("Post data in PostDetailContent:", {
    is_edited: post.is_edited,
    original_content: post.original_content
  });

  return (
    <Card className="mb-6 p-6">
      <PostHeader 
        author={post.author}
        timestamp={post.timestamp}
        onUsernameClick={handleUsernameClick}
      />
      <div className="mt-4">
        <PostText 
          content={post.content} 
          truncate={false} 
          isEdited={post.is_edited || false}
          originalContent={post.original_content || null}
        />
      </div>
      {post.media_urls && post.media_urls.length > 0 && (
        <PostMedia 
          mediaUrls={post.media_urls} 
          onMediaClick={handleMediaClick}
          subscription={subscription}
        />
      )}
      <PostActions
        post={post}
        currentUserId={currentUserId}
        onAction={onPostAction}
      />
    </Card>
  );
};
