import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteActionProps {
  postId: string;
  authorId: string;
  currentUserId: string;
  onAction: (postId: string, action: 'delete') => void;
}

export const DeleteAction = ({ postId, authorId, currentUserId, onAction }: DeleteActionProps) => {
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Delete button clicked for post:', postId);
    onAction(postId, 'delete');
  };

  // Only show delete button if the current user is the author
  if (authorId !== currentUserId) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-red-500 hover:text-red-600 hover:bg-red-100/10"
      onClick={handleDelete}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
};