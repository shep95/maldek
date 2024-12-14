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

export const ProfileTabs = () => {
  const { userId } = useParams();
  const session = useSession();
  const isCurrentUser = session?.user?.id === userId;
  const isMobile = useIsMobile();

  // Use the URL userId parameter instead of the session user id
  const profileUserId = userId;

  if (!profileUserId) return null;

  console.log('ProfileTabs - Displaying tabs for user:', profileUserId);

  const tabs = [
    { value: "posts", label: "Posts", component: <PostsTab userId={profileUserId} /> },
    { value: "replies", label: "Replies", component: <RepliesTab userId={profileUserId} /> },
    { value: "media", label: "Media", component: <MediaTab userId={profileUserId} /> },
    { value: "videos", label: "Videos", component: <VideosTab userId={profileUserId} /> },
    { value: "likes", label: "Likes", component: <LikesTab userId={profileUserId} /> },
    { value: "followers", label: "Followers", component: <FollowersTab userId={profileUserId} /> },
    { value: "following", label: "Following", component: <FollowingTab userId={profileUserId} /> },
  ];

  // Only show analytics tab for the current user's profile
  if (isCurrentUser) {
    tabs.push({ 
      value: "analytics", 
      label: "Analytics", 
      component: <AnalyticsTab userId={profileUserId} /> 
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