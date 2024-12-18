import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Bell, Heart, MessageCircle, Share2, Bookmark, Repeat, UserPlus } from "lucide-react";
import type { Notification } from "@/hooks/useNotifications";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

interface NotificationListProps {
  notifications: Notification[];
  isLoading?: boolean;
  onBulkAction?: (action: 'read' | 'archive' | 'delete', ids: string[]) => void;
}

export const NotificationList = ({ notifications, isLoading, onBulkAction }: NotificationListProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const navigate = useNavigate();

  useEffect(() => {
    const markNotificationsAsRead = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        console.log('Marking notifications as read for user:', user.id);
        
        const { error } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('recipient_id', user.id)
          .eq('read', false);

        if (error) {
          console.error('Error marking notifications as read:', error);
          toast.error('Failed to mark notifications as read');
        } else {
          console.log('Successfully marked notifications as read');
          toast.success('Notifications marked as read');
        }
      } catch (error) {
        console.error('Error in markNotificationsAsRead:', error);
        toast.error('An error occurred while updating notifications');
      }
    };

    // Only mark as read when viewing the notifications
    if (notifications.length > 0) {
      markNotificationsAsRead();
    }
  }, [notifications]);

  const handleSelectAll = () => {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map(n => n.id));
    }
  };

  const handleBulkAction = async (action: 'read' | 'archive' | 'delete') => {
    if (selectedIds.length === 0) {
      toast.error('Please select notifications first');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in');
        return;
      }

      let updateData = {};
      switch (action) {
        case 'read':
          updateData = { read: true };
          break;
        case 'archive':
          updateData = { archived: true };
          break;
        case 'delete':
          updateData = { deleted_at: new Date().toISOString() };
          break;
      }

      const { error } = await supabase
        .from('notifications')
        .update(updateData)
        .in('id', selectedIds)
        .eq('recipient_id', user.id);

      if (error) {
        console.error(`Error performing bulk action ${action}:`, error);
        toast.error(`Failed to ${action} notifications`);
      } else {
        toast.success(`Successfully ${action === 'read' ? 'marked as read' : action + 'd'} ${selectedIds.length} notifications`);
        onBulkAction?.(action, selectedIds);
        setSelectedIds([]); // Clear selection after successful action
      }
    } catch (error) {
      console.error(`Error in handleBulkAction:`, error);
      toast.error('An error occurred while updating notifications');
    }
  };

  const sortedNotifications = [...notifications].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/4" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-8 mt-4 bg-card/50 border-dashed">
        <Bell className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium text-muted-foreground">No notifications yet</p>
        <p className="text-sm text-muted-foreground/60">
          When someone interacts with your content, you'll see it here
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selectedIds.length === notifications.length}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm text-muted-foreground">
            {selectedIds.length} selected
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction('read')}
            disabled={selectedIds.length === 0}
          >
            Mark as Read
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction('archive')}
            disabled={selectedIds.length === 0}
          >
            Archive
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction('delete')}
            disabled={selectedIds.length === 0}
          >
            Delete
          </Button>
          <Select
            value={sortOrder}
            onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest first</SelectItem>
              <SelectItem value="asc">Oldest first</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-16rem)]">
        <div className="space-y-3 pr-4">
          {sortedNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={cn(
                "p-4 transition-all duration-200 hover:bg-accent/5 cursor-pointer",
                !notification.read && "bg-accent/5",
                selectedIds.includes(notification.id) && "border-accent"
              )}
            >
              <div className="flex items-start gap-4">
                <Checkbox
                  checked={selectedIds.includes(notification.id)}
                  onCheckedChange={(checked) => {
                    setSelectedIds(prev =>
                      checked
                        ? [...prev, notification.id]
                        : prev.filter(id => id !== notification.id)
                    );
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
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
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
