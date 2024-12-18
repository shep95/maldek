import { Search, TrendingUp } from "lucide-react";
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

  // Enhanced search with more relevant fields and better ranking
  const { data: searchResults, isLoading: isLoadingSearch } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: async () => {
      if (!searchQuery) return { users: [], posts: [] };

      console.log("Searching for:", searchQuery);
      
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        console.log("No active session, skipping search");
        return { users: [], posts: [] };
      }
      
      // Enhanced user search with engagement metrics
      const usersResponse = await supabase
        .from('profiles')
        .select(`
          id, 
          username, 
          avatar_url, 
          follower_count,
          bio,
          total_posts,
          total_likes_received
        `)
        .or(`
          username.ilike.%${searchQuery}%,
          bio.ilike.%${searchQuery}%
        `)
        .order('follower_count', { ascending: false })
        .limit(5);

      // Enhanced post search with engagement metrics and relevance
      const postsResponse = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          likes,
          view_count,
          media_urls,
          profiles (
            username,
            avatar_url,
            follower_count
          )
        `)
        .or(`
          content.ilike.%${searchQuery}%,
          profiles.username.ilike.%${searchQuery}%
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (usersResponse.error) {
        console.error("Search users error:", usersResponse.error);
        throw usersResponse.error;
      }

      if (postsResponse.error) {
        console.error("Search posts error:", postsResponse.error);
        throw postsResponse.error;
      }

      return {
        users: usersResponse.data || [],
        posts: postsResponse.data || []
      };
    },
    enabled: searchQuery.length > 0
  });

  // Enhanced trending users with activity metrics and engagement
  const { data: trendingUsers, isLoading: isLoadingTrending } = useQuery({
    queryKey: ['trending-users'],
    queryFn: async () => {
      console.log("Fetching trending users with enhanced metrics...");
      
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        console.log("No active session, skipping trending users fetch");
        return [];
      }

      // Get users who have been active recently and have good engagement
      const { data: users, error } = await supabase
        .from('profiles')
        .select(`
          id, 
          username, 
          follower_count, 
          avatar_url,
          total_posts,
          total_likes_received,
          total_views,
          last_active
        `)
        .gt('last_active', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Active in last 7 days
        .gt('total_posts', 0) // Has made at least one post
        .order('total_likes_received', { ascending: false })
        .limit(5);

      if (error) {
        console.error("Trending users error:", error);
        throw error;
      }

      return users || [];
    },
    refetchInterval: 60000 // Refresh every minute
  });

  const handleSearch = debounce((value: string) => {
    console.log("Search query:", value);
    setSearchQuery(value);
  }, 300);

  return (
    <div className="hidden lg:block fixed right-0 h-screen p-4 w-80">
      <Card className="h-[90vh] flex flex-col border-muted bg-[#0d0d0d]/80 backdrop-blur-lg p-4 rounded-xl shadow-xl">
        <div className="relative mb-6">
          <Input 
            placeholder="Search @users or posts" 
            className="pl-10 border-accent/20 bg-background/50 focus:border-accent transition-colors rounded-lg"
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        {searchQuery && (
          <div className="mb-6 space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              Search Results
            </h3>
            <SearchResults 
              isLoading={isLoadingSearch} 
              results={searchResults}
            />
          </div>
        )}

        <div className="flex flex-col gap-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            Trending Users
          </h3>
          <TrendingUsers 
            isLoading={isLoadingTrending} 
            users={trendingUsers} 
          />
        </div>
      </Card>
    </div>
  );
};