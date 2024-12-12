import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { debounce } from "lodash";
import { toast } from "sonner";

export const RightSidebar = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Search users
  const { data: searchResults, isLoading: isLoadingSearch } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: async () => {
      if (!searchQuery) return { users: [] };

      console.log("Searching for:", searchQuery);
      
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        console.log("No active session, skipping search");
        return { users: [] };
      }
      
      const usersResponse = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${searchQuery}%`)
        .limit(5);

      if (usersResponse.error) {
        console.error("Search error:", usersResponse.error);
        if (usersResponse.error.message?.includes('user_not_found') || usersResponse.error.code === '403') {
          toast.error("Please sign in again to continue");
          return { users: [] };
        }
        throw usersResponse.error;
      }

      return {
        users: usersResponse.data || []
      };
    },
    enabled: searchQuery.length > 0
  });

  // Fetch trending topics
  const { data: trendingUsers, isLoading: isLoadingTrending } = useQuery({
    queryKey: ['trending-users'],
    queryFn: async () => {
      console.log("Fetching trending users...");
      
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        console.log("No active session, skipping trending users fetch");
        return [];
      }

      const { data: users, error } = await supabase
        .from('profiles')
        .select('username, follower_count, avatar_url')
        .order('follower_count', { ascending: false })
        .limit(5);

      if (error) {
        console.error("Trending users error:", error);
        if (error.message?.includes('user_not_found') || error.code === '403') {
          toast.error("Please sign in again to continue");
          return [];
        }
        throw error;
      }

      return users || [];
    },
    refetchInterval: 60000
  });

  const handleSearch = debounce((value: string) => {
    setSearchQuery(value);
  }, 300);

  return (
    <div className="hidden lg:block fixed right-0 h-screen p-4 w-80">
      <Card className="h-[90vh] flex flex-col border-muted bg-[#0d0d0d] backdrop-blur-sm p-4">
        <div className="relative mb-6">
          <Input 
            placeholder="Search @users" 
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
            ) : searchResults?.users.length === 0 ? (
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
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <h3 className="font-semibold text-lg">Trending Users</h3>
          {isLoadingTrending ? (
            <div className="animate-pulse space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 bg-muted rounded-md" />
              ))}
            </div>
          ) : trendingUsers?.length === 0 ? (
            <p className="text-muted-foreground">No trending users yet</p>
          ) : (
            <div className="space-y-2">
              {trendingUsers?.map((user) => (
                <div 
                  key={user.username} 
                  className="flex justify-between items-center hover:bg-accent/10 p-2 rounded-md cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>{user.username[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">@{user.username}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{user.follower_count} followers</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};