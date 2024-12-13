import { useState } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

export const ProfileTabs = () => {
  const { userId } = useParams();
  const session = useSession();
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

  const renderTabContent = (value: string) => {
    switch (value) {
      case "posts":
        return <PostsTab userId={targetUserId} />;
      case "replies":
        return <RepliesTab userId={targetUserId} />;
      case "media":
        return <MediaTab userId={targetUserId} />;
      case "videos":
        return <VideosTab userId={targetUserId} />;
      case "likes":
        return <LikesTab userId={targetUserId} />;
      case "followers":
        return <FollowersTab userId={targetUserId} />;
      case "following":
        return <FollowingTab userId={targetUserId} />;
      case "analytics":
        return isCurrentUser ? <AnalyticsTab userId={targetUserId} /> : null;
      default:
        return null;
    }
  };

  return (
    <Tabs defaultValue="posts" className="w-full">
      <div className="border-b border-muted sticky top-0 bg-background z-10">
        <ScrollArea className="w-full" type="scroll">
          <TabsList className={cn(
            "w-full justify-start rounded-none bg-transparent h-auto",
            isMobile ? "min-w-[800px] px-2" : "inline-flex"
          )}>
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
                  isMobile ? "py-2 px-4 text-sm" : "py-3 px-6"
                )}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>
      </div>

      <div className="mt-4 w-full px-2 md:px-0">
        {tabs.map((tab) => (
          <TabsContent 
            key={tab.value}
            value={tab.value}
            className="w-full data-[state=active]:animate-in data-[state=active]:fade-in-0"
          >
            {renderTabContent(tab.value)}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
};