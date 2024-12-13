import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface VideoCardProps {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  userId: string;
  currentUserId: string;
  onDelete?: () => void;
}

export const VideoCard = ({
  id,
  title,
  description,
  thumbnailUrl,
  videoUrl,
  userId,
  currentUserId,
  onDelete
}: VideoCardProps) => {
  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Also delete the video and thumbnail from storage
      const videoPath = videoUrl.split('/').pop();
      const thumbnailPath = thumbnailUrl.split('/').pop();

      if (videoPath) {
        await supabase.storage
          .from('videos')
          .remove([videoPath]);
      }

      if (thumbnailPath) {
        await supabase.storage
          .from('videos')
          .remove([thumbnailPath]);
      }

      toast.success('Video deleted successfully');
      onDelete?.();
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Failed to delete video');
    }
  };

  return (
    <Card className="overflow-hidden bg-card/50 backdrop-blur-sm">
      <AspectRatio ratio={16 / 9}>
        <img
          src={thumbnailUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
      </AspectRatio>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          {userId === currentUserId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </Card>
  );
};