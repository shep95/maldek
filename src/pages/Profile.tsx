import { useEffect, useState } from "react";
import { MapPin, Calendar, Camera, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";

interface ProfileData {
  username: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  follower_count: number;
}

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const { toast } = useToast();
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      try {
        console.log("Fetching profile data...");
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          console.error("Auth error:", authError);
          throw new Error('Not authenticated');
        }

        console.log("User authenticated, fetching profile...");
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        // If no profile exists, create one
        if (profileError && profileError.message.includes('JSON object requested, multiple (or no) rows returned')) {
          console.log("No profile found, creating new profile...");
          
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                username: `user_${user.id.slice(0, 8)}`,
                bio: '',
                avatar_url: null,
                follower_count: 0
              }
            ])
            .select()
            .single();

          if (createError) {
            console.error("Profile creation error:", createError);
            throw createError;
          }

          console.log("New profile created:", newProfile);
          setIsCurrentUser(true);
          setEditBio(newProfile.bio || "");
          return newProfile as ProfileData;
        }

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          throw profileError;
        }

        console.log("Profile data fetched:", existingProfile);
        setIsCurrentUser(true);
        setEditBio(existingProfile.bio || "");
        return existingProfile as ProfileData;
      } catch (error) {
        console.error("Profile fetch error:", error);
        throw error;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false
  });

  const handleUpdateProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to update your profile",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ bio: editBio })
        .eq('id', user.id);

      if (error) {
        throw error;
      }
      
      setIsEditing(false);
      refetch();
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Update profile error:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    console.log("Profile is loading...");
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    console.log("Profile error or no data:", error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Error loading profile. Please refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Banner */}
      <div className="relative h-48 bg-gradient-to-r from-gray-900 to-black">
        <div className="absolute -bottom-16 left-6">
          <Avatar className="h-32 w-32 border-4 border-background">
            <AvatarImage src={profile.avatar_url} alt={profile.username} />
            <AvatarFallback>{profile.username[0]}</AvatarFallback>
          </Avatar>
        </div>
        {isCurrentUser && (
          <div className="absolute right-4 top-4 flex gap-2">
            <Button variant="outline" size="sm" className="bg-background/10 backdrop-blur">
              <Camera className="h-4 w-4 mr-2" />
              Add banner
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-background/10 backdrop-blur"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancel" : "Edit profile"}
            </Button>
          </div>
        )}
      </div>

      {/* Profile Info */}
      <Card className="border-none bg-transparent shadow-none">
        <div className="px-6 pt-20 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">@{profile.username}</h1>
              </div>
            </div>
            {isCurrentUser && (
              <Button variant="outline" className="bg-accent text-white hover:bg-accent/90">
                Get verified
              </Button>
            )}
          </div>

          {isEditing ? (
            <div className="mt-4">
              <Textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Tell us about yourself..."
                className="min-h-[100px]"
              />
              <Button 
                onClick={handleUpdateProfile}
                className="mt-2 bg-accent hover:bg-accent/90"
              >
                Save Changes
              </Button>
            </div>
          ) : (
            <p className="mt-4 text-lg">{profile.bio || "No bio yet"}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-4 text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
          </div>

          <div className="mt-4 flex gap-4">
            <button className="hover:underline">
              <span className="font-bold text-foreground">{profile.follower_count}</span>{" "}
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