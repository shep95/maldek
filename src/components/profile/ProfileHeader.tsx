import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProfilePosts } from "./ProfilePosts";
import { ProfileMusicTab } from "./ProfileMusicTab";
import { EditProfileDialog } from "./EditProfileDialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "@supabase/auth-helpers-react";

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
      <div className="flex flex-col items-center p-8 space-y-4 border-b">
        <Avatar className="h-24 w-24">
          <AvatarImage src={profile?.avatar_url} />
          <AvatarFallback>{profile?.username?.[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h1 className="text-2xl font-bold">@{profile?.username}</h1>
          <p className="text-gray-600">{profile?.bio || "No bio yet"}</p>
        </div>
        {isOwnProfile && <EditProfileDialog profile={profile} onProfileUpdate={() => {}} />}
      </div>

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none px-4">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          {isOwnProfile && <TabsTrigger value="music">Music</TabsTrigger>}
        </TabsList>
        <TabsContent value="posts">
          <ProfilePosts posts={[]} isLoading={false} onPostAction={() => {}} />
        </TabsContent>
        <TabsContent value="media">
          <div className="p-4">Media content coming soon</div>
        </TabsContent>
        {isOwnProfile && (
          <TabsContent value="music">
            <ProfileMusicTab />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};