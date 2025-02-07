import { Search, TrendingUp, Handshake } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { debounce } from "lodash";
import { SearchResults } from "./sidebar/SearchResults";
import { TrendingPosts } from "./sidebar/TrendingPosts";

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

  // Fetch only top 3 trending posts from the last 72 hours
  const { data: trendingPosts, isLoading: isLoadingTrending } = useQuery({
    queryKey: ['trending-posts'],
    queryFn: async () => {
      console.log("Fetching top 3 trending posts from last 72 hours...");
      
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        console.log("No active session, skipping trending posts fetch");
        return [];
      }

      const threeDaysAgo = new Date();
      threeDaysAgo.setHours(threeDaysAgo.getHours() - 72);

      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          engagement_score,
          profiles (
            username,
            avatar_url
          )
        `)
        .gt('created_at', threeDaysAgo.toISOString())
        .order('engagement_score', { ascending: false })
        .limit(3); // Explicitly limit to top 3 trending posts

      if (error) {
        console.error("Trending posts error:", error);
        throw error;
      }

      return posts || [];
    },
    refetchInterval: 300000 // Refresh every 5 minutes
  });

  const handleSearch = debounce((value: string) => {
    console.log("Search query:", value);
    setSearchQuery(value);
  }, 300);

  const isZukoLinkActive = () => {
    const launchDate = new Date('2025-05-08T00:00:00Z');
    return new Date() >= launchDate;
  };

  const handleZukoClick = (e: React.MouseEvent) => {
    if (!isZukoLinkActive()) {
      e.preventDefault();
    }
  };

  return (
    <div className="hidden lg:block fixed right-0 h-screen p-4 w-80">
      <Card className="h-[90vh] flex flex-col bg-black/20 border-border/50 backdrop-blur-md p-4 rounded-xl">
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

        <div className="flex flex-col gap-4 mb-6">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            Trending Posts
          </h3>
          <TrendingPosts 
            isLoading={isLoadingTrending} 
            posts={trendingPosts} 
          />
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Handshake className="h-5 w-5 text-accent" />
            Our Partnerships
          </h3>
          <div className="space-y-3">
            <a 
              href="https://zukoi.app" 
              onClick={handleZukoClick}
              className={`block p-3 bg-background/50 rounded-lg hover:bg-background/70 transition-colors ${!isZukoLinkActive() ? 'cursor-not-allowed opacity-75' : ''}`}
            >
              <div className="flex items-center gap-3">
                <img
                  src="/lovable-uploads/2a16aca0-4a66-480f-87a7-e08925ee962b.png"
                  alt="Zuko Logo"
                  className="w-8 h-8 rounded-lg"
                />
                <div className="text-left">
                  <p className="text-sm font-medium">Zuko</p>
                  <p className="text-xs text-muted-foreground">AI & Machine Learning Partner</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
};
