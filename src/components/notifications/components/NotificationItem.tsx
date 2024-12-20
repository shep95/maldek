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
      return `${username} liked your post`;
    case 'comment':
      return `${username} commented on your post`;
    case 'share':
      return `${username} shared your post`;
    case 'bookmark':
      return `${username} bookmarked your post`;
    case 'repost':
      return `${username} reposted your post`;
    case 'new_follow':
      return `${username} started following you`;
    default:
      return `${username} interacted with your post`;
  }
};

interface NotificationItemProps {
  notification: Notification;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
}

export const NotificationItem = ({ notification, isSelected, onSelect }: NotificationItemProps) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleNotificationClick = async (e: React.MouseEvent) => {
    // Prevent click event if checkbox is clicked
    if ((e.target as HTMLElement).closest('.checkbox-container')) {
      return;
    }

    console.log('Notification clicked:', {
      id: notification.id,
      type: notification.type,
      currentReadStatus: notification.read
    });

    try {
      // Only mark as read if it's not already read
      if (!notification.read) {
        console.log('Attempting to mark notification as read:', notification.id);
        const { error } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', notification.id);

        if (error) {
          console.error('Error updating notification:', error);
          toast.error('Failed to mark notification as read');
          throw error;
        }

        console.log('Successfully marked notification as read');

        // Invalidate queries to update the UI
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

      // Navigate based on notification type
      const navigatePath = notification.type === 'new_follow' 
        ? `/profiles/${notification.actor_id}`
        : `/post/${notification.post_id}`;
      
      console.log('Navigating to:', navigatePath);
      navigate(navigatePath);
      
    } catch (error) {
      console.error('Error handling notification click:', error);
      toast.error('Failed to process notification');
    }
  };

  return (
    <Card
      className={cn(
        "p-4 transition-all duration-200 hover:bg-accent/5 cursor-pointer",
        !notification.read && "bg-accent/5",
        isSelected && "border-accent"
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
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </Card>
  );
};