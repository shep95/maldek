import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { debounce } from "lodash";
import { SearchResults } from "./sidebar/SearchResults";
import { TrendingUsers } from "./sidebar/TrendingUsers";

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
        throw usersResponse.error;
      }

      return {
        users: usersResponse.data || []
      };
    },
    enabled: searchQuery.length > 0
  });

  // Fetch trending users
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
        .select('id, username, follower_count, avatar_url')
        .order('follower_count', { ascending: false })
        .limit(5);

      if (error) {
        console.error("Trending users error:", error);
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
            <SearchResults 
              isLoading={isLoadingSearch} 
              results={searchResults?.users} 
            />
          </div>
        )}

        <div className="flex flex-col gap-4">
          <h3 className="font-semibold text-lg">Trending Users</h3>
          <TrendingUsers 
            isLoading={isLoadingTrending} 
            users={trendingUsers} 
          />
        </div>
      </Card>
    </div>
  );
};