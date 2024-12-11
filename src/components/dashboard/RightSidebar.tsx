import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";

export const RightSidebar = () => {
  // In a real app, this would fetch from your backend
  const { data: trendingTopics } = useQuery({
    queryKey: ['trending-topics'],
    queryFn: async () => {
      console.log("Fetching trending topics...");
      // Simulate API call - replace with actual backend call
      return [
        { topic: "#Technology", posts: "12.5K", engagement: 985 },
        { topic: "#Gaming", posts: "8.2K", engagement: 756 },
        { topic: "#AI", posts: "6.7K", engagement: 654 },
        { topic: "#Crypto", posts: "5.9K", engagement: 432 },
        { topic: "#Design", posts: "4.3K", engagement: 321 },
      ].sort((a, b) => b.engagement - a.engagement);
    },
    refetchInterval: 60000 // Refetch every minute
  });

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
            {trendingTopics?.map((item) => (
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