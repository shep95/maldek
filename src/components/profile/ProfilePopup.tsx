
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CircuitBoard, Signal, Lock, User } from "lucide-react";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfilePosts } from "@/components/profile/ProfilePosts";
import { ProfileMusicTab } from "@/components/profile/ProfileMusicTab";
import { ProfilePrivacyTab } from "@/components/profile/ProfilePrivacyTab";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  isOwnProfile: boolean;
  posts: any[];
  isLoading: boolean;
}

export const ProfilePopup = ({ isOpen, onClose, profile, isOwnProfile, posts, isLoading }: ProfilePopupProps) => {
  if (!profile) return null;

  const handlePostAction = async (postId: string, action: 'like' | 'bookmark' | 'delete' | 'repost') => {
    try {
      if (action === 'delete') {
        const { error } = await supabase
          .from('posts')
          .delete()
          .eq('id', postId);

        if (error) throw error;
        toast.success('Post deleted successfully');
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      toast.error(`Failed to ${action} post`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] p-0 gap-0 bg-background/60 backdrop-blur-xl border-border/50 sm:mt-0 sm:mb-0 mt-4 mb-4 mx-4 sm:mx-0 rounded-xl">
        <div className="overflow-y-auto max-h-[90vh] scrollbar-none">
          <ProfileHeader profile={profile} isLoading={false} />
          
          <div className="px-6 pb-6">
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="w-full justify-start h-14 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 p-1 mb-8 overflow-hidden">
                <TabsTrigger 
                  value="posts" 
                  className="relative h-12 px-6 rounded-xl data-[state=active]:bg-gradient-to-r from-accent to-accent/80 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:text-accent gap-2"
                >
                  <CircuitBoard className="w-4 h-4" />
                  <span className="relative z-10">Posts</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="music" 
                  className="relative h-12 px-6 rounded-xl data-[state=active]:bg-gradient-to-r from-accent to-accent/80 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:text-accent gap-2"
                >
                  <Signal className="w-4 h-4" />
                  <span className="relative z-10">Music</span>
                </TabsTrigger>
                {isOwnProfile && (
                  <TabsTrigger 
                    value="privacy" 
                    className="relative h-12 px-6 rounded-xl data-[state=active]:bg-gradient-to-r from-accent to-accent/80 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:text-accent gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span className="relative z-10">Privacy</span>
                  </TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="posts" className="mt-0 animate-fade-in">
                <ProfilePosts 
                  posts={posts || []} 
                  isLoading={isLoading} 
                  onPostAction={handlePostAction} 
                />
              </TabsContent>

              <TabsContent value="music" className="mt-0 animate-fade-in">
                <ProfileMusicTab />
              </TabsContent>

              {isOwnProfile && (
                <TabsContent value="privacy" className="mt-0 animate-fade-in">
                  <ProfilePrivacyTab userId={profile.id} />
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
