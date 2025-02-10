
import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { StoriesDialog } from "./StoriesDialog";

interface StoryRingProps {
  hasUnviewedStory?: boolean; // Make optional since we'll compute it
  className?: string;
  children: React.ReactNode;
  userId: string; // Add userId to check stories for specific user
}

export const StoryRing = ({ className, children, userId }: StoryRingProps) => {
  const session = useSession();
  const [isStoriesOpen, setIsStoriesOpen] = useState(false);

  const { data: hasUnviewedStory = false } = useQuery({
    queryKey: ['unviewed-stories', userId],
    queryFn: async () => {
      if (!session?.user?.id) return false;

      // Get active stories for the user (not expired)
      const { data: stories } = await supabase
        .from('stories')
        .select('id')
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString())
        .eq('is_expired', false);

      if (!stories?.length) return false;

      // Check if the current user has viewed all stories
      const { data: views } = await supabase
        .from('story_views')
        .select('story_id')
        .eq('viewer_id', session.user.id)
        .in('story_id', stories.map(s => s.id));

      const viewedStoryIds = new Set(views?.map(v => v.story_id) || []);
      
      // Return true if there are any stories that haven't been viewed
      return stories.some(story => !viewedStoryIds.has(story.id));
    },
    enabled: !!session?.user?.id && !!userId,
  });

  return (
    <>
      <div 
        className={cn(
          "relative rounded-full cursor-pointer",
          hasUnviewedStory && "p-[3px] bg-gradient-to-br from-[#F97316] to-white",
          className
        )}
        onClick={() => setIsStoriesOpen(true)}
      >
        <div className="bg-background rounded-full">
          {children}
        </div>
      </div>

      <StoriesDialog 
        isOpen={isStoriesOpen}
        onOpenChange={setIsStoriesOpen}
        userId={userId}
      />
    </>
  );
};
