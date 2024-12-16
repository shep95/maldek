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

  const targetUserId = userId || session?.user?.id;

  if (!targetUserId) return null;

  const tabs = [
    { value: "posts", label: "Posts", component: <PostsTab userId={targetUserId} /> },
    { value: "replies", label: "Replies", component: <RepliesTab userId={targetUserId} /> },
    { value: "media", label: "Media", component: <MediaTab userId={targetUserId} /> },
    { value: "videos", label: "Videos", component: <VideosTab userId={targetUserId} /> },
    { value: "likes", label: "Likes", component: <LikesTab userId={targetUserId} /> },
    { value: "followers", label: "Followers", component: <FollowersTab userId={targetUserId} /> },
    { value: "following", label: "Following", component: <FollowingTab userId={targetUserId} /> },
  ];

  if (isCurrentUser) {
    tabs.push({ 
      value: "analytics", 
      label: "Analytics", 
      component: <AnalyticsTab userId={targetUserId} /> 
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