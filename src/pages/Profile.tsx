import { useEffect, useState } from "react";
import { MapPin, Calendar, Camera, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ProfileData {
  username: string;
  displayName: string;
  bio: string;
  location: string;
  joinedDate: string;
  following: number;
  followers: number;
  isVerified: boolean;
  avatarUrl: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<ProfileData>({
    username: "asher_united",
    displayName: "shepherd newton",
    bio: "Entrepreneur",
    location: "Lee County, FL",
    joinedDate: "August 2023",
    following: 86,
    followers: 954,
    isVerified: true,
    avatarUrl: "/lovable-uploads/77fcff77-e620-4c3e-8219-425f6b1a6018.png"
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header Banner */}
      <div className="relative h-48 bg-gradient-to-r from-gray-900 to-black">
        <div className="absolute -bottom-16 left-6">
          <Avatar className="h-32 w-32 border-4 border-background">
            <AvatarImage src={profile.avatarUrl} alt={profile.displayName} />
            <AvatarFallback>{profile.displayName[0]}</AvatarFallback>
          </Avatar>
        </div>
        <div className="absolute right-4 top-4 flex gap-2">
          <Button variant="outline" size="sm" className="bg-background/10 backdrop-blur">
            <Camera className="h-4 w-4 mr-2" />
            Add banner
          </Button>
          <Button variant="outline" size="sm" className="bg-background/10 backdrop-blur">
            Edit profile
          </Button>
        </div>
      </div>

      {/* Profile Info */}
      <Card className="border-none bg-transparent shadow-none">
        <div className="px-6 pt-20 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{profile.displayName}</h1>
                {profile.isVerified && (
                  <CheckCircle className="h-5 w-5 text-accent fill-accent" />
                )}
              </div>
              <p className="text-muted-foreground">@{profile.username}</p>
            </div>
            <Button variant="outline" className="bg-accent text-white hover:bg-accent/90">
              Get verified
            </Button>
          </div>

          <p className="mt-4 text-lg">{profile.bio}</p>

          <div className="mt-4 flex flex-wrap gap-4 text-muted-foreground">
            <div className="flex items-center">
              <MapPin className="mr-1 h-4 w-4" />
              {profile.location}
            </div>
            <div className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              Joined {profile.joinedDate}
            </div>
          </div>

          <div className="mt-4 flex gap-4">
            <button className="hover:underline">
              <span className="font-bold text-foreground">{profile.following}</span>{" "}
              <span className="text-muted-foreground">Following</span>
            </button>
            <button className="hover:underline">
              <span className="font-bold text-foreground">{profile.followers}</span>{" "}
              <span className="text-muted-foreground">Followers</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent">
            <TabsTrigger
              value="posts"
              className={cn(
                "rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent"
              )}
            >
              Posts
            </TabsTrigger>
            <TabsTrigger
              value="replies"
              className={cn(
                "rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent"
              )}
            >
              Replies
            </TabsTrigger>
            <TabsTrigger
              value="highlights"
              className={cn(
                "rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent"
              )}
            >
              Highlights
            </TabsTrigger>
            <TabsTrigger
              value="articles"
              className={cn(
                "rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent"
              )}
            >
              Articles
            </TabsTrigger>
            <TabsTrigger
              value="media"
              className={cn(
                "rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent"
              )}
            >
              Media
            </TabsTrigger>
            <TabsTrigger
              value="likes"
              className={cn(
                "rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent"
              )}
            >
              Likes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="min-h-[400px]">
            <div className="p-4 text-center text-muted-foreground">
              No posts yet
            </div>
          </TabsContent>
          <TabsContent value="replies" className="min-h-[400px]">
            <div className="p-4 text-center text-muted-foreground">
              No replies yet
            </div>
          </TabsContent>
          <TabsContent value="highlights" className="min-h-[400px]">
            <div className="p-4 text-center text-muted-foreground">
              No highlights yet
            </div>
          </TabsContent>
          <TabsContent value="articles" className="min-h-[400px]">
            <div className="p-4 text-center text-muted-foreground">
              No articles yet
            </div>
          </TabsContent>
          <TabsContent value="media" className="min-h-[400px]">
            <div className="p-4 text-center text-muted-foreground">
              No media yet
            </div>
          </TabsContent>
          <TabsContent value="likes" className="min-h-[400px]">
            <div className="p-4 text-center text-muted-foreground">
              No likes yet
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Profile;