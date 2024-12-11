import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { debounce } from "lodash";

export const RightSidebar = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch trending topics
  const { data: trendingTopics, isLoading: isLoadingTrending } = useQuery({
    queryKey: ['trending-topics'],
    queryFn: async () => {
      console.log("Fetching trending topics...");
      const { data: posts, error } = await supabase
        .from('posts')
        .select('topic, count(*)')
        .not('topic', 'is', null)
        .group('topic')
        .order('count', { ascending: false })
        .limit(5);

      if (error) throw error;
      return posts || [];
    },
    refetchInterval: 60000 // Refetch every minute
  });

  // Search users and posts
  const { data: searchResults, isLoading: isLoadingSearch } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: async () => {
      if (!searchQuery) return { users: [], posts: [] };

      console.log("Searching for:", searchQuery);
      
      const [usersResponse, postsResponse] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .ilike('username', `%${searchQuery}%`)
          .limit(5),
        
        supabase
          .from('posts')
          .select('id, content')
          .ilike('content', `%${searchQuery}%`)
          .limit(5)
      ]);

      return {
        users: usersResponse.data || [],
        posts: postsResponse.data || []
      };
    },
    enabled: searchQuery.length > 0
  });

  const handleSearch = debounce((value: string) => {
    setSearchQuery(value);
  }, 300);

  return (
    <div className="hidden lg:block fixed right-0 h-screen p-4 w-80">
      <Card className="h-[90vh] flex flex-col border-muted bg-[#0d0d0d] backdrop-blur-sm p-4">
        <div className="relative mb-6">
          <Input 
            placeholder="Search @users or posts" 
            className="pl-10 border-accent focus:ring-accent"
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        {searchQuery && (
          <div className="mb-6 space-y-4">
            <h3 className="font-semibold text-lg">Search Results</h3>
            {isLoadingSearch ? (
              <div className="animate-pulse space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-muted rounded-md" />
                ))}
              </div>
            ) : searchResults?.users.length === 0 && searchResults?.posts.length === 0 ? (
              <p className="text-muted-foreground">No results found</p>
            ) : (
              <div className="space-y-2">
                {searchResults?.users.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-2 hover:bg-accent/10 rounded-md cursor-pointer">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>{user.username[0]}</AvatarFallback>
                    </Avatar>
                    <span>@{user.username}</span>
                  </div>
                ))}
                {searchResults?.posts.map((post) => (
                  <div key={post.id} className="p-2 hover:bg-accent/10 rounded-md cursor-pointer">
                    <p className="line-clamp-2 text-sm">{post.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <h3 className="font-semibold text-lg">Trending Topics</h3>
          {isLoadingTrending ? (
            <div className="animate-pulse space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 bg-muted rounded-md" />
              ))}
            </div>
          ) : trendingTopics?.length === 0 ? (
            <p className="text-muted-foreground">No trending topics yet</p>
          ) : (
            <div className="space-y-2">
              {trendingTopics?.map((item) => (
                <div 
                  key={item.topic} 
                  className="flex justify-between items-center hover:bg-accent/10 p-2 rounded-md cursor-pointer transition-colors"
                >
                  <span className="font-medium">#{item.topic}</span>
                  <span className="text-sm text-muted-foreground">{item.count} posts</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};