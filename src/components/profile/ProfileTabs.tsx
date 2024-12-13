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
import { useSession } from "@supabase/auth-helpers-react";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

export const ProfileTabs = () => {
  const { userId } = useParams();
  const session = useSession();
  const [activeTab, setActiveTab] = useState("posts");
  const isCurrentUser = session?.user?.id === userId;
  const isMobile = useIsMobile();

  const targetUserId = userId || session?.user?.id;

  if (!targetUserId) {
    return null;
  }

  const tabs = [
    { value: "posts", label: "Posts" },
    { value: "replies", label: "Replies" },
    { value: "media", label: "Media" },
    { value: "videos", label: "Videos" },
    { value: "likes", label: "Likes" },
    { value: "followers", label: "Followers" },
    { value: "following", label: "Following" },
  ];

  if (isCurrentUser) {
    tabs.push({ value: "analytics", label: "Analytics" });
  }

  const handleTabChange = (value: string) => {
    console.log("Tab change requested:", value);
    setActiveTab(value);
  };

  return (
    <Tabs 
      value={activeTab}
      onValueChange={handleTabChange}
      className="w-full"
    >
      <div className="border-b border-muted sticky top-0 bg-background z-10">
        <ScrollArea className="w-full" type={isMobile ? "scroll" : "auto"}>
          <TabsList 
            className={cn(
              "w-full justify-start rounded-none bg-transparent h-auto",
              isMobile ? "flex min-w-[800px] px-2" : "inline-flex min-w-full"
            )}
          >
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  "rounded-none border-b-2 border-transparent",
                  "data-[state=active]:border-accent data-[state=active]:bg-transparent",
                  "data-[state=active]:text-accent hover:text-accent",
                  "transition-colors duration-300 capitalize",
                  "focus:outline-none focus-visible:ring-0",
                  "touch-manipulation select-none whitespace-nowrap",
                  isMobile ? "py-2 px-4 text-sm" : "py-3 px-6"
                )}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>
      </div>

      <div className="mt-4 overflow-x-hidden">
        <TabsContent value="posts" className="animate-in fade-in-50">
          <PostsTab userId={targetUserId} />
        </TabsContent>

        <TabsContent value="replies" className="animate-in fade-in-50">
          <RepliesTab userId={targetUserId} />
        </TabsContent>

        <TabsContent value="media" className="animate-in fade-in-50">
          <MediaTab userId={targetUserId} />
        </TabsContent>

        <TabsContent value="videos" className="animate-in fade-in-50">
          <VideosTab userId={targetUserId} />
        </TabsContent>

        <TabsContent value="likes" className="animate-in fade-in-50">
          <LikesTab userId={targetUserId} />
        </TabsContent>

        <TabsContent value="followers" className="animate-in fade-in-50">
          <FollowersTab userId={targetUserId} />
        </TabsContent>

        <TabsContent value="following" className="animate-in fade-in-50">
          <FollowingTab userId={targetUserId} />
        </TabsContent>

        {isCurrentUser && (
          <TabsContent value="analytics" className="animate-in fade-in-50">
            <AnalyticsTab userId={targetUserId} />
          </TabsContent>
        )}
      </div>
    </Tabs>
  );
};