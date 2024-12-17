import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useParams } from "react-router-dom";
import { PostsTab } from "./tabs/PostsTab";
import { RepliesTab } from "./tabs/RepliesTab";
import { MediaTab } from "./tabs/MediaTab";
import { VideosTab } from "./tabs/VideosTab";
import { LikesTab } from "./tabs/LikesTab";
import { AnalyticsTab } from "./tabs/AnalyticsTab";
import { FollowersTab } from "./tabs/FollowersTab";
import { FollowingTab } from "./tabs/FollowingTab";
import { useSession } from '@supabase/auth-helpers-react';
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const ProfileTabs = () => {
  const { username } = useParams();
  const session = useSession();
  const isMobile = useIsMobile();

  // Get the profile ID for the username in the URL
  const { data: profile } = useQuery({
    queryKey: ['profile-id', username],
    queryFn: async () => {
      console.log('Fetching profile ID for username:', username);
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username?.replace('@', ''))
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }

      console.log('Found profile:', data);
      return data;
    },
    enabled: !!username
  });

  if (!profile?.id) {
    console.log('No profile ID found for username:', username);
    return null;
  }

  const isCurrentUser = session?.user?.id === profile.id;
  console.log('Profile tabs - Current user check:', { 
    sessionUserId: session?.user?.id, 
    profileId: profile.id,
    isCurrentUser 
  });

  const tabs = [
    { value: "posts", label: "Posts", component: <PostsTab userId={profile.id} /> },
    { value: "replies", label: "Replies", component: <RepliesTab userId={profile.id} /> },
    { value: "media", label: "Media", component: <MediaTab userId={profile.id} /> },
    { value: "videos", label: "Videos", component: <VideosTab userId={profile.id} /> },
    { value: "likes", label: "Likes", component: <LikesTab userId={profile.id} /> },
    { value: "followers", label: "Followers", component: <FollowersTab userId={profile.id} /> },
    { value: "following", label: "Following", component: <FollowingTab userId={profile.id} /> },
  ];

  // Only show analytics tab for the current user's profile
  if (isCurrentUser) {
    tabs.push({ 
      value: "analytics", 
      label: "Analytics", 
      component: <AnalyticsTab userId={profile.id} /> 
    });
  }

  return (
    <Tabs defaultValue="posts" className="w-full">
      <div className="border-b border-muted sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <ScrollArea className="w-full" type="scroll">
          <TabsList className={cn(
            "w-full h-auto rounded-none bg-transparent",
            "inline-flex items-center justify-start",
            "no-scrollbar",
            isMobile ? "gap-1 px-2" : "gap-4"
          )}>
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  "flex-shrink-0",
                  "rounded-none border-b-2 border-transparent",
                  "data-[state=active]:border-accent data-[state=active]:bg-transparent",
                  "data-[state=active]:text-accent hover:text-accent",
                  "transition-all duration-300 capitalize",
                  "focus:outline-none focus-visible:ring-0",
                  "touch-manipulation select-none",
                  "active:scale-95",
                  isMobile ? "py-3 px-4 text-sm" : "py-3 px-6"
                )}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      </div>

      <div className="mt-4 w-full px-2 md:px-0">
        {tabs.map((tab) => (
          <TabsContent 
            key={tab.value}
            value={tab.value}
            className="w-full data-[state=active]:animate-in data-[state=active]:fade-in-0"
          >
            {tab.component}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
};