import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const RightSidebar = () => {
  const trendingTopics = [
    { topic: "#Technology", posts: "12.5K posts" },
    { topic: "#Gaming", posts: "8.2K posts" },
    { topic: "#AI", posts: "6.7K posts" },
    { topic: "#Crypto", posts: "5.9K posts" },
    { topic: "#Design", posts: "4.3K posts" },
  ];

  return (
    <div className="hidden lg:block fixed right-0 h-screen p-4 w-80">
      <Card className="h-[90vh] flex flex-col border-muted bg-[#0d0d0d] backdrop-blur-sm p-4">
        <div className="relative mb-6">
          <Input 
            placeholder="Search @users, posts, or topics" 
            className="pl-10 border-accent focus:ring-accent"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-semibold text-lg">Trending Topics</h3>
          <div className="space-y-4">
            {trendingTopics.map((item) => (
              <div 
                key={item.topic} 
                className="flex justify-between items-center hover:bg-accent/10 p-2 rounded-md cursor-pointer transition-colors"
              >
                <span className="font-medium">{item.topic}</span>
                <span className="text-sm text-muted-foreground">{item.posts}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};