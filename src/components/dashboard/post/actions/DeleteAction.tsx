import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DeleteActionProps {
  postId: string;
  authorId: string;
  currentUserId: string;
  onAction: (postId: string, action: 'delete') => void;
}

export const DeleteAction = ({ postId, authorId, currentUserId, onAction }: DeleteActionProps) => {
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);
      
      if (deleteError) throw deleteError;
      onAction(postId, 'delete');
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  return authorId === currentUserId ? (
    <Button
      variant="ghost"
      size="sm"
      className="text-red-500 hover:text-red-600"
      onClick={handleDelete}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  ) : null;
};