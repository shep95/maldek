import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useParams } from "react-router-dom";
import { PostsTab } from "./tabs/PostsTab";
import { RepliesTab } from "./tabs/RepliesTab";
import { MediaTab } from "./tabs/MediaTab";
import { VideosTab } from "./tabs/VideosTab";
import { LikesTab } from "./tabs/LikesTab";

export const ProfileTabs = () => {
  const { userId } = useParams();

  if (!userId) {
    return null;
  }

  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="w-full justify-start rounded-none border-b bg-transparent">
        {["posts", "replies", "media", "videos", "likes"].map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab}
            className={cn(
              "rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-accent hover:text-accent transition-colors duration-300 capitalize"
            )}
          >
            {tab}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="posts" className="min-h-[400px]">
        <PostsTab userId={userId} />
      </TabsContent>

      <TabsContent value="replies" className="min-h-[400px]">
        <RepliesTab userId={userId} />
      </TabsContent>

      <TabsContent value="media" className="min-h-[400px]">
        <MediaTab userId={userId} />
      </TabsContent>

      <TabsContent value="videos" className="min-h-[400px]">
        <VideosTab userId={userId} />
      </TabsContent>

      <TabsContent value="likes" className="min-h-[400px]">
        <LikesTab userId={userId} />
      </TabsContent>
    </Tabs>
  );
};