import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export const ProfileTabs = () => {
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

      {["posts", "replies", "media", "videos", "likes"].map((tab) => (
        <TabsContent key={tab} value={tab} className="min-h-[400px]">
          <div className="p-4 text-center text-muted-foreground">
            <div className="p-8 rounded-lg bg-gradient-to-b from-background/50 to-background/30 backdrop-blur-sm border border-accent/10 animate-fade-in">
              No {tab} yet
            </div>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};