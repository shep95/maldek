import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import type { Notification } from "@/hooks/useNotifications";
import { NotificationItem } from "./components/NotificationItem";
import { NotificationActions } from "./components/NotificationActions";
import { EmptyState } from "./components/EmptyState";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface NotificationListProps {
  notifications: Notification[];
  isLoading?: boolean;
}

export const NotificationList = ({ notifications, isLoading }: NotificationListProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

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

    setIsProcessing(true);
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

      console.log(`Performing bulk ${action} action on notifications:`, selectedIds);

      const { error } = await supabase
        .from('notifications')
        .update(updateData)
        .in('id', selectedIds)
        .eq('recipient_id', user.id);

      if (error) {
        console.error(`Error performing bulk action ${action}:`, error);
        toast.error(`Failed to ${action} notifications`);
        return;
      }

      // Only invalidate the queries after successful update
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

      toast.success(`Successfully ${action === 'read' ? 'marked as read' : action + 'd'} ${selectedIds.length} notifications`);
      setSelectedIds([]); // Clear selection after successful action
      
    } catch (error) {
      console.error(`Error in handleBulkAction:`, error);
      toast.error('An error occurred while updating notifications');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <EmptyState type="loading" />;
  }

  if (notifications.length === 0) {
    return <EmptyState type="notifications" />;
  }

  const sortedNotifications = [...notifications].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Checkbox
          checked={selectedIds.length === notifications.length}
          onCheckedChange={handleSelectAll}
        />
      </div>

      <NotificationActions
        selectedCount={selectedIds.length}
        onMarkRead={() => handleBulkAction('read')}
        onArchive={() => handleBulkAction('archive')}
        onDelete={() => handleBulkAction('delete')}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
        isProcessing={isProcessing}
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