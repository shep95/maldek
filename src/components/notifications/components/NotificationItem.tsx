
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDistanceToNow } from "date-fns";
import { Bell, Heart, MessageCircle, Share2, Bookmark, Repeat, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Notification } from "@/hooks/useNotifications";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'like':
      return <Heart className="h-4 w-4 text-red-500" />;
    case 'comment':
      return <MessageCircle className="h-4 w-4 text-blue-500" />;
    case 'share':
      return <Share2 className="h-4 w-4 text-green-500" />;
    case 'bookmark':
      return <Bookmark className="h-4 w-4 text-purple-500" />;
    case 'repost':
      return <Repeat className="h-4 w-4 text-orange-500" />;
    case 'new_follow':
      return <UserPlus className="h-4 w-4 text-accent" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const getNotificationText = (type: Notification['type'], username: string) => {
  switch (type) {
    case 'like':
      return <span><span className="font-semibold">{username}</span> liked your post</span>;
    case 'comment':
      return <span><span className="font-semibold">{username}</span> commented on your post</span>;
    case 'share':
      return <span><span className="font-semibold">{username}</span> shared your post</span>;
    case 'bookmark':
      return <span><span className="font-semibold">{username}</span> bookmarked your post</span>;
    case 'repost':
      return <span><span className="font-semibold">{username}</span> reposted your post</span>;
    case 'new_follow':
      return <span><span className="font-semibold">{username}</span> followed you</span>;
    default:
      return <span><span className="font-semibold">{username}</span> interacted with your content</span>;
  }
};

interface NotificationItemProps {
  notification: Notification;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
}

interface PostPreview {
  content: string;
  media_urls?: string[];
}

export const NotificationItem = ({ notification, isSelected, onSelect }: NotificationItemProps) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [postPreview, setPostPreview] = useState<PostPreview | null>(null);

  // Fetch post details for preview
  useEffect(() => {
    const fetchPostPreview = async () => {
      // Don't fetch for follow notifications
      if (notification.type === 'new_follow' || !notification.post_id) return;
      
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('content, media_urls')
          .eq('id', notification.post_id)
          .single();
          
        if (error) {
          console.error('Error fetching post preview:', error);
          return;
        }
        
        if (data) {
          setPostPreview({
            content: data.content,
            media_urls: data.media_urls
          });
        }
      } catch (error) {
        console.error('Error in post preview fetch:', error);
      }
    };
    
    fetchPostPreview();
  }, [notification.post_id, notification.type]);

  const handleNotificationClick = async (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.checkbox-container')) {
      console.log('Checkbox clicked, preventing notification click');
      return;
    }

    console.log('Notification clicked:', {
      id: notification.id,
      type: notification.type,
      currentReadStatus: notification.read
    });

    try {
      if (!notification.read) {
        console.log('Attempting to mark notification as read:', notification.id);
        const { error } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', notification.id)
          .select();

        if (error) {
          console.error('Error updating notification:', error);
          toast.error('Failed to mark notification as read');
          throw error;
        }

        console.log('Successfully marked notification as read');

        await Promise.all([
          queryClient.invalidateQueries({ 
            queryKey: ['notifications'],
            exact: true 
          }),
          queryClient.invalidateQueries({ 
            queryKey: ['unread-notifications-count'],
            exact: true 
          })
        ]);

        console.log('Queries invalidated successfully');
      }

      const navigatePath = notification.type === 'new_follow' 
        ? `/@${notification.actor.username}`
        : `/post/${notification.post_id}`;
      
      console.log('Navigating to:', navigatePath);
      navigate(navigatePath);
      
    } catch (error) {
      console.error('Error handling notification click:', error);
      toast.error('Failed to process notification');
    }
  };

  // Helper to truncate post content
  const truncateContent = (content: string, maxLength = 60) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <Card
      className={cn(
        "p-4 transition-all duration-300 cursor-pointer rounded-xl",
        "bg-card/50 backdrop-blur-sm border-border/30",
        "hover:bg-card/70 hover:border-border/50 hover:shadow-lg",
        !notification.read && "bg-accent/5 border-accent/20",
        isSelected && "border-accent/50 bg-accent/10"
      )}
      onClick={handleNotificationClick}
    >
      <div className="flex items-start gap-4">
        <div className="checkbox-container">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <Avatar className="h-10 w-10 border-2 border-background">
          <AvatarImage src={notification.actor.avatar_url || undefined} />
          <AvatarFallback className="bg-accent text-accent-foreground">
            {notification.actor.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            {getNotificationIcon(notification.type)}
            <p className="text-sm font-medium">
              {getNotificationText(notification.type, notification.actor.username)}
            </p>
          </div>
          
          {postPreview && notification.type !== 'new_follow' && (
            <div className="mt-2 pl-1 border-l-2 border-accent/30 text-sm text-muted-foreground">
              <p className="line-clamp-1">{truncateContent(postPreview.content)}</p>
              {postPreview.media_urls && postPreview.media_urls.length > 0 && (
                <div className="flex items-center gap-1 text-xs mt-1 text-accent">
                  {postPreview.media_urls.length === 1 ? 'Media attached' : `${postPreview.media_urls.length} media items`}
                </div>
              )}
            </div>
          )}
          
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </Card>
  );
};
