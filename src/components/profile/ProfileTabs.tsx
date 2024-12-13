import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useParams } from "react-router-dom";
import { PostsTab } from "./tabs/PostsTab";
import { RepliesTab } from "./tabs/RepliesTab";
import { MediaTab } from "./tabs/MediaTab";
import { VideosTab } from "./tabs/VideosTab";
import { LikesTab } from "./tabs/LikesTab";
import { AnalyticsTab } from "./tabs/AnalyticsTab";
import { useSession } from "@supabase/auth-helpers-react";
import { useState, useEffect } from "react";

export const ProfileTabs = () => {
  const { userId } = useParams();
  const session = useSession();
  const [activeTab, setActiveTab] = useState("posts");
  const isCurrentUser = session?.user?.id === userId;

  // If no userId is provided in the URL, use the current user's ID
  const targetUserId = userId || session?.user?.id;

  if (!targetUserId) {
    return null;
  }

  console.log("ProfileTabs - Current active tab:", activeTab);
  console.log("ProfileTabs - Target user ID:", targetUserId);

  const tabs = [
    { value: "posts", label: "Posts" },
    { value: "replies", label: "Replies" },
    { value: "media", label: "Media" },
    { value: "videos", label: "Videos" },
    { value: "likes", label: "Likes" },
  ];

  // Only show analytics tab for the current user's profile
  if (isCurrentUser) {
    tabs.push({ value: "analytics", label: "Analytics" });
  }

  return (
    <Tabs 
      value={activeTab}
      onValueChange={(value) => {
        console.log("Tab value changed to:", value);
        setActiveTab(value);
      }}
      className="w-full"
    >
      <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto flex-wrap">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={cn(
              "rounded-none border-b-2 border-transparent",
              "data-[state=active]:border-accent data-[state=active]:bg-transparent",
              "data-[state=active]:text-accent hover:text-accent",
              "transition-colors duration-300 capitalize py-2"
            )}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="posts" className="mt-6">
        <PostsTab userId={targetUserId} />
      </TabsContent>

      <TabsContent value="replies" className="mt-6">
        <RepliesTab userId={targetUserId} />
      </TabsContent>

      <TabsContent value="media" className="mt-6">
        <MediaTab userId={targetUserId} />
      </TabsContent>

      <TabsContent value="videos" className="mt-6">
        <VideosTab userId={targetUserId} />
      </TabsContent>

      <TabsContent value="likes" className="mt-6">
        <LikesTab userId={targetUserId} />
      </TabsContent>

      {isCurrentUser && (
        <TabsContent value="analytics" className="mt-6">
          <AnalyticsTab userId={targetUserId} />
        </TabsContent>
      )}
    </Tabs>
  );
};