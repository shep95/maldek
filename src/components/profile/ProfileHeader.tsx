import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProfilePosts } from "./ProfilePosts";
import { ProfileMusicTab } from "./ProfileMusicTab";
import { EditProfileDialog } from "./EditProfileDialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "@supabase/auth-helpers-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProfileHeaderProps {
  profile: any;
  isLoading: boolean;
}

const colorOptions = [
  { name: 'Orange', value: '#F97316' },
  { name: 'Soft Orange', value: '#FEC6A1' },
  { name: 'Red', value: '#ea384c' }
];

export const ProfileHeader = ({ profile, isLoading }: ProfileHeaderProps) => {
  const session = useSession();
  const isOwnProfile = session?.user?.id === profile?.id;
  const [showColorPicker, setShowColorPicker] = useState(false);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleColorChange = async (color: string) => {
    try {
      console.log('Updating accent color:', color);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          theme_preference: JSON.stringify({ accent_color: color })
        })
        .eq('id', session?.user?.id);

      if (error) throw error;

      // Update CSS variable
      document.documentElement.style.setProperty('--accent', color);
      toast.success('Theme updated successfully');
      setShowColorPicker(false);
    } catch (error) {
      console.error('Error updating theme:', error);
      toast.error('Failed to update theme');
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col items-center p-8 space-y-4 border-b bg-black/20 backdrop-blur-sm">
        <Avatar className="h-24 w-24 ring-2 ring-accent/20 transition-transform hover:scale-105">
          <AvatarImage src={profile?.avatar_url} />
          <AvatarFallback>{profile?.username?.[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h1 className="text-2xl font-bold">@{profile?.username}</h1>
          <p className="text-muted-foreground">{profile?.bio || "No bio yet"}</p>
        </div>
        <div className="flex gap-2">
          {isOwnProfile && (
            <>
              <EditProfileDialog profile={profile} onProfileUpdate={() => {}} />
              <Button
                variant="outline"
                className="border-accent text-accent hover:bg-accent hover:text-white"
                onClick={() => setShowColorPicker(!showColorPicker)}
              >
                <Palette className="h-4 w-4 mr-2" />
                Theme
              </Button>
            </>
          )}
        </div>
        
        {showColorPicker && isOwnProfile && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 p-2 rounded-lg bg-card/80 backdrop-blur-sm"
          >
            {colorOptions.map((color) => (
              <button
                key={color.value}
                onClick={() => handleColorChange(color.value)}
                className="w-8 h-8 rounded-full transition-transform hover:scale-110 ring-2 ring-white/20"
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </motion.div>
        )}
      </div>

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="w-full h-auto justify-start border-b rounded-none px-4 bg-black/20 backdrop-blur-sm">
          <TabsTrigger 
            value="posts"
            className={cn(
              "relative py-4 data-[state=active]:text-accent",
              "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5",
              "after:bg-accent after:transform after:scale-x-0 after:transition-transform",
              "data-[state=active]:after:scale-x-100"
            )}
          >
            Posts
          </TabsTrigger>
          <TabsTrigger 
            value="media"
            className={cn(
              "relative py-4 data-[state=active]:text-accent",
              "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5",
              "after:bg-accent after:transform after:scale-x-0 after:transition-transform",
              "data-[state=active]:after:scale-x-100"
            )}
          >
            Media
          </TabsTrigger>
          {isOwnProfile && (
            <TabsTrigger 
              value="music"
              className={cn(
                "relative py-4 data-[state=active]:text-accent",
                "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5",
                "after:bg-accent after:transform after:scale-x-0 after:transition-transform",
                "data-[state=active]:after:scale-x-100"
              )}
            >
              Music
            </TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="posts" className="animate-in fade-in-50 slide-in-from-bottom-3">
          <ProfilePosts posts={[]} isLoading={false} onPostAction={() => {}} />
        </TabsContent>
        <TabsContent value="media" className="animate-in fade-in-50 slide-in-from-bottom-3">
          <div className="p-4">Media content coming soon</div>
        </TabsContent>
        {isOwnProfile && (
          <TabsContent value="music" className="animate-in fade-in-50 slide-in-from-bottom-3">
            <ProfileMusicTab />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};