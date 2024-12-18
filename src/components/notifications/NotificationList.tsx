import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Bell } from "lucide-react";
import type { Notification } from "@/hooks/useNotifications";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NotificationActions } from "./components/NotificationActions";
import { NotificationItem } from "./components/NotificationItem";
import { handleBulkAction } from "./utils/notificationUtils";

interface NotificationListProps {
  notifications: Notification[];
  isLoading?: boolean;
  onBulkAction?: (action: 'read' | 'archive' | 'delete', ids: string[]) => void;
}

export const NotificationList = ({ 
  notifications, 
  isLoading, 
  onBulkAction 
}: NotificationListProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

    if (notifications.length > 0) {
      markNotificationsAsRead();
    }
  }, [notifications]);

  const handleSelectAll = () => {
    setSelectedIds(
      selectedIds.length === notifications.length
        ? []
        : notifications.map(n => n.id)
    );
  };

  const handleBulkActionClick = (action: 'read' | 'archive' | 'delete') => {
    handleBulkAction(action, selectedIds, (action, ids) => {
      onBulkAction?.(action, ids);
      setSelectedIds([]);
    });
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
      <NotificationActions
        selectedCount={selectedIds.length}
        onSelectAll={handleSelectAll}
        allSelected={selectedIds.length === notifications.length}
        onAction={handleBulkActionClick}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
      />

      <ScrollArea className="h-[calc(100vh-16rem)]">
        <div className="space-y-3 pr-4">
          {sortedNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              isSelected={selectedIds.includes(notification.id)}
              onSelect={(checked) => {
                setSelectedIds(prev =>
                  checked
                    ? [...prev, notification.id]
                    : prev.filter(id => id !== notification.id)
                );
              }}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};