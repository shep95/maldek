import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { VideoPlayer } from "@/components/videos/VideoPlayer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download, ExternalLink, Bookmark, Share2, ThumbsUp, ThumbsDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { CommentSection } from "@/components/dashboard/post/detail/CommentSection";

const VideoDetail = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const session = useSession();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // Fetch video details
  const { data: video, isLoading, error } = useQuery({
    queryKey: ['video', videoId],
    queryFn: async () => {
      if (!videoId) throw new Error('No video ID provided');

      // First increment the view count
      try {
        await supabase.rpc('increment_post_view', { post_id: videoId });
      } catch (error) {
        console.error('Error incrementing view count:', error);
      }

      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            avatar_url,
            follower_count
          )
        `)
        .eq('id', videoId)
        .single();

      if (error) {
        console.error('Error fetching video:', error);
        throw error;
      }

      return data;
    },
    enabled: !!videoId,
  });

  // Fetch comments
  const { data: comments = [] } = useQuery({
    queryKey: ['video-comments', videoId],
    queryFn: async () => {
      if (!videoId) return [];

      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          parent_id,
          gif_url,
          user:profiles (
            id,
            username,
            avatar_url
          )
        `)
        .eq('post_id', videoId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        throw error;
      }

      return data;
    },
    enabled: !!videoId,
  });

  // Check if user has liked the video
  useEffect(() => {
    if (!videoId || !session?.user?.id) return;

    const checkLikeStatus = async () => {
      const { data: likeData, error: likeError } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', videoId)
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (likeError) {
        console.error('Error checking like status:', likeError);
      } else {
        setIsLiked(!!likeData);
      }

      // Get total likes count
      const { count, error: countError } = await supabase
        .from('post_likes')
        .select('*', { count: 'exact' })
        .eq('post_id', videoId);

      if (countError) {
        console.error('Error getting likes count:', countError);
      } else {
        setLikesCount(count || 0);
      }
    };

    checkLikeStatus();
  }, [videoId, session?.user?.id]);

  const handleLike = async () => {
    if (!session?.user?.id) {
      toast.error('You must be logged in to like videos');
      return;
    }

    try {
      if (isLiked) {
        // Unlike
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', videoId)
          .eq('user_id', session.user.id);
        
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
        toast.success('Video unliked');
      } else {
        // Like
        await supabase
          .from('post_likes')
          .insert({
            post_id: videoId,
            user_id: session.user.id
          });
        
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
        
        // If previously disliked, remove dislike
        if (isDisliked) {
          setIsDisliked(false);
        }
        
        toast.success('Video liked');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like status');
    }
  };

  const handleDownload = () => {
    if (!video?.video_url) return;
    
    // Get public URL if it's a storage path
    let publicUrl = video.video_url;
    if (!video.video_url.startsWith('http')) {
      const { data } = supabase.storage
        .from('videos')
        .getPublicUrl(video.video_url);
      publicUrl = data.publicUrl;
    }

    // Create an anchor element and trigger download
    const a = document.createElement('a');
    a.href = publicUrl;
    a.download = video.title || 'video';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast.success('Download started');
  };

  const handleOpenOriginal = () => {
    if (!video?.video_url) return;
    
    // Get public URL if it's a storage path
    let publicUrl = video.video_url;
    if (!video.video_url.startsWith('http')) {
      const { data } = supabase.storage
        .from('videos')
        .getPublicUrl(video.video_url);
      publicUrl = data.publicUrl;
    }

    window.open(publicUrl, '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: video?.title || 'Check out this video',
        text: video?.description || 'Watch this video on Bosley',
        url: window.location.href
      }).catch(err => {
        console.error('Error sharing:', err);
        toast.error('Failed to share video');
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href)
        .then(() => toast.success('Link copied to clipboard'))
        .catch(() => toast.error('Failed to copy link'));
    }
  };
  
  const handleCommentAction = async (postId: string, action: 'like' | 'bookmark' | 'delete' | 'repost') => {
    // We'll implement this later if needed
    console.log('Comment action:', action, postId);
  };

  // Show error state if video fetch fails
  if (error) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold mb-4">Error Loading Video</h2>
        <p className="text-muted-foreground mb-4">
          There was a problem loading this video. It may have been removed or is unavailable.
        </p>
        <Button onClick={() => navigate('/videos')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Videos
        </Button>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Button variant="ghost" onClick={() => navigate('/videos')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Videos
        </Button>
        <Skeleton className="aspect-video w-full rounded-xl" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold mb-4">Video Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The video you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate('/videos')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Videos
        </Button>
      </div>
    );
  }

  // Get public URL for video
  const getVideoUrl = () => {
    if (!video?.video_url) return '';
    if (video.video_url.startsWith('http')) return video.video_url;
    
    const { data } = supabase.storage
      .from('videos')
      .getPublicUrl(video.video_url);
    
    return data.publicUrl;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate('/videos')}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Videos
      </Button>
      
      {/* Video Player */}
      <div className="rounded-xl overflow-hidden bg-black shadow-xl">
        <VideoPlayer videoUrl={getVideoUrl()} />
      </div>
      
      {/* Title and Actions Bar */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{video.title}</h1>
        
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <span>{video.view_count ? video.view_count.toLocaleString() : "0"} views</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant={isLiked ? "default" : "outline"} 
              size="sm"
              onClick={handleLike}
              className="flex gap-2"
            >
              <ThumbsUp className="h-4 w-4" />
              <span>{likesCount}</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleOpenOriginal}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Original
            </Button>
          </div>
        </div>
      </div>
      
      {/* Channel Information */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12 border">
                <AvatarImage src={video.profiles?.avatar_url || undefined} />
                <AvatarFallback>{video.profiles?.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
              </Avatar>
              
              <div>
                <h3 className="font-semibold">@{video.profiles?.username || 'Unknown'}</h3>
                <p className="text-sm text-muted-foreground">
                  {video.profiles?.follower_count || 0} followers
                </p>
              </div>
            </div>
            
            {session?.user?.id !== video.user_id && (
              <Button variant="outline" size="sm">
                Follow
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Description */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <p className="whitespace-pre-line">{video.description}</p>
        </CardContent>
      </Card>
      
      {/* Comments Section */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <CommentSection 
            postId={videoId || ''} 
            comments={comments} 
            currentUserId={session?.user?.id || ''}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoDetail;
