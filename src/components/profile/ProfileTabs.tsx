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
import { useState } from "react";

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

  const handleTabChange = (value: string) => {
    console.log("Tab changed to:", value);
    setActiveTab(value);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="w-full justify-start rounded-none border-b bg-transparent">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={cn(
              "rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-accent hover:text-accent transition-colors duration-300 capitalize"
            )}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="posts" className="min-h-[400px]">
        <PostsTab userId={targetUserId} />
      </TabsContent>

      <TabsContent value="replies" className="min-h-[400px]">
        <RepliesTab userId={targetUserId} />
      </TabsContent>

      <TabsContent value="media" className="min-h-[400px]">
        <MediaTab userId={targetUserId} />
      </TabsContent>

      <TabsContent value="videos" className="min-h-[400px]">
        <VideosTab userId={targetUserId} />
      </TabsContent>

      <TabsContent value="likes" className="min-h-[400px]">
        <LikesTab userId={targetUserId} />
      </TabsContent>

      {isCurrentUser && (
        <TabsContent value="analytics" className="min-h-[400px]">
          <AnalyticsTab userId={targetUserId} />
        </TabsContent>
      )}
    </Tabs>
  );
};