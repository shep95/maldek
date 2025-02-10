
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProfilePosts } from "./ProfilePosts";
import { ProfileMusicTab } from "./ProfileMusicTab";
import { EditProfileDialog } from "./EditProfileDialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "@supabase/auth-helpers-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { StoryRing } from "./StoryRing";

interface ProfileHeaderProps {
  profile: any;
  isLoading: boolean;
}

export const ProfileHeader = ({ profile, isLoading }: ProfileHeaderProps) => {
  const session = useSession();
  const isOwnProfile = session?.user?.id === profile?.id;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full">
      <div className="flex flex-col items-center p-8 space-y-4 border-b bg-black/20 backdrop-blur-sm">
        <StoryRing userId={profile?.id}>
          <Avatar className="h-24 w-24 ring-2 ring-accent/20 transition-transform hover:scale-105">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback>{profile?.username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
        </StoryRing>
        <div className="text-center">
          <h1 className="text-2xl font-bold">@{profile?.username}</h1>
          <p className="text-muted-foreground">{profile?.bio || "No bio yet"}</p>
        </div>
        {isOwnProfile && <EditProfileDialog profile={profile} onProfileUpdate={() => {}} />}
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
