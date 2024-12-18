import { Notification } from "@/hooks/useNotifications";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'like':
      return 'heart';
    case 'comment':
      return 'message-circle';
    case 'share':
      return 'share2';
    case 'bookmark':
      return 'bookmark';
    case 'repost':
      return 'repeat';
    case 'new_follow':
      return 'user-plus';
    default:
      return 'bell';
  }
};

export const getNotificationText = (type: Notification['type'], username: string) => {
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

export const handleBulkAction = async (
  action: 'read' | 'archive' | 'delete',
  selectedIds: string[],
  onSuccess?: (action: string, ids: string[]) => void
) => {
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
      onSuccess?.(action, selectedIds);
    }
  } catch (error) {
    console.error(`Error in handleBulkAction:`, error);
    toast.error('An error occurred while updating notifications');
  }
};