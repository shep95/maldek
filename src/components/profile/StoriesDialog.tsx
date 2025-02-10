
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface StoriesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export const StoriesDialog = ({ isOpen, onOpenChange, userId }: StoriesDialogProps) => {
  const session = useSession();
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: stories = [] } = useQuery({
    queryKey: ['user-stories', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('stories')
        .select('*')
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString())
        .eq('is_expired', false)
        .order('created_at', { ascending: true });
      
      return data || [];
    },
  });

  // Mark story as viewed
  const markAsViewed = async (storyId: string) => {
    if (!session?.user?.id) return;
    
    await supabase
      .from('story_views')
      .upsert({
        story_id: storyId,
        viewer_id: session.user.id,
      })
      .select();
  };

  if (!stories.length) return null;

  const currentStory = stories[currentIndex];

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onOpenChange(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-transparent border-none">
        <div className="relative w-full h-[80vh] flex items-center justify-center">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-white bg-black/20 hover:bg-black/40"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Navigation buttons */}
          {currentIndex > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 z-50 text-white bg-black/20 hover:bg-black/40"
              onClick={handlePrevious}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          {currentIndex < stories.length - 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 z-50 text-white bg-black/20 hover:bg-black/40"
              onClick={handleNext}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}

          {/* Story content */}
          {currentStory && (
            <div 
              className="w-full h-full flex items-center justify-center"
              onMouseDown={() => markAsViewed(currentStory.id)}
            >
              {currentStory.media_type.startsWith('video') ? (
                <video
                  src={currentStory.media_url}
                  className="max-h-full w-auto object-contain"
                  controls
                  autoPlay
                  onEnded={handleNext}
                />
              ) : (
                <img
                  src={currentStory.media_url}
                  className="max-h-full w-auto object-contain"
                  onLoad={() => {
                    markAsViewed(currentStory.id);
                    // Auto advance image stories after duration
                    setTimeout(handleNext, (currentStory.duration || 5) * 1000);
                  }}
                />
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
