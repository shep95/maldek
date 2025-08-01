
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Flame, Clock, Award, ChevronRight, CalendarDays, Users, BarChart3 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useBlockedUsers } from "@/hooks/useBlockedUsers";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

type TrendingFilter = "trending" | "recent" | "creators";

const Followers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<TrendingFilter>("trending");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const session = useSession();
  const { blockedUserIds, blockUser, unblockUser, isBlocking, isUnblocking } = useBlockedUsers();

  const { data: followingData, refetch: refetchFollowing } = useQuery({
    queryKey: ['following-status', selectedUser?.id],
    queryFn: async () => {
      if (!session?.user?.id || !selectedUser?.id) return null;
      
      const { data, error } = await supabase
        .from('followers')
        .select('*')
        .eq('follower_id', session.user.id)
        .eq('following_id', selectedUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking follow status:', error);
        throw error;
      }

      return data;
    },
    enabled: !!session?.user?.id && !!selectedUser?.id,
  });

  const { data: searchResults, isLoading, refetch: refetchSearch } = useQuery({
    queryKey: ['user-search', searchQuery, selectedFilter],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*, user_subscriptions(tier_id, subscription_tiers(name, checkmark_color))')
        .order('follower_count', { ascending: false })
        .not('avatar_url', 'is', null) // Only include users with an avatar
        .limit(5); // Limit to top 5 users

      // Filter based on selected tab
      if (selectedFilter === "recent") {
        query = query.order('last_active', { ascending: false });
      } else if (selectedFilter === "creators") {
        query = query.not('user_subscriptions', 'is', null);
      }

      // Apply search if query exists
      if (searchQuery.trim()) {
        query = query.ilike('username', `%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error searching users:', error);
        throw error;
      }

      // Calculate trending rank and growth metrics (simulate for now)
      const enrichedData = data?.map((user, index) => {
        const trendingRank = index + 1;
        const followerGrowth = Math.floor(Math.random() * 50) + 1;
        const weeklyGrowthPercent = Math.floor(Math.random() * 15) + 1;
        
        return {
          ...user,
          trendingRank,
          followerGrowth,
          weeklyGrowthPercent
        };
      });

      return enrichedData || [];
    }
  });

  const { data: userPosts } = useQuery({
    queryKey: ['user-posts', selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser?.id) return [];
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            id,
            username,
            avatar_url
          ),
          post_likes (
            id,
            user_id
          ),
          bookmarks (
            id,
            user_id
          ),
          comments (
            id
          )
        `)
        .eq('user_id', selectedUser.id)
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) throw error;
      return data;
    },
    enabled: !!selectedUser?.id
  });

  const { data: userVideos } = useQuery({
    queryKey: ['user-videos', selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser?.id) return [];
      
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', selectedUser.id)
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) throw error;
      return data;
    },
    enabled: !!selectedUser?.id
  });

  const handleFollow = async (userId: string) => {
    try {
      if (!session?.user?.id) {
        toast.error("Please sign in to follow users");
        return;
      }

      const { error } = await supabase
        .from('followers')
        .insert({
          follower_id: session.user.id,
          following_id: userId
        });

      if (error) {
        if (error.code === '23505') {
          toast.error("You are already following this user");
          return;
        }
        throw error;
      }

      toast.success("Successfully followed user");
      refetchFollowing();
      refetchSearch();

      if (selectedUser?.id === userId) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (data) {
          setSelectedUser(data);
        }
      }
    } catch (error) {
      console.error("Error following user:", error);
      toast.error("Failed to follow user");
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      if (!session?.user?.id) return;

      const { error } = await supabase
        .from('followers')
        .delete()
        .eq('follower_id', session.user.id)
        .eq('following_id', userId);

      if (error) throw error;

      toast.success("Successfully unfollowed user");
      refetchFollowing();
      refetchSearch();

      if (selectedUser?.id === userId) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (data) {
          setSelectedUser(data);
        }
      }
    } catch (error) {
      console.error("Error unfollowing user:", error);
      toast.error("Failed to unfollow user");
    }
  };

  const handleBlockUser = (userId: string) => {
    if (!session) {
      toast.error("Please sign in to block users");
      return;
    }
    if (blockedUserIds && !blockedUserIds.includes(userId)) {
      blockUser(userId);
    }
  };
  
  const handleUnblockUser = (userId: string) => {
    if (!session) {
      toast.error("Please sign in to unblock users");
      return;
    }
    if (blockedUserIds && blockedUserIds.includes(userId)) {
      unblockUser(userId);
    }
  };

  const renderTrendingIcon = (rank: number) => {
    if (rank <= 3) return <Flame className="h-4 w-4 text-orange-500" />;
    if (rank <= 10) return <Flame className="h-4 w-4 text-orange-400" />;
    return <Flame className="h-4 w-4 text-orange-300" />;
  };

  return (
    <div className="min-h-screen w-full p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Trending Users</h1>
          <p className="text-muted-foreground text-sm">
            Discover the most influential and viral creators
          </p>
        </div>

        {/* Mobile-first responsive layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          {/* Left Section - User List */}
          <div className="flex flex-col space-y-6 min-h-0">
            {/* Search */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Search for trending creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-black/30 border-accent/20 focus:border-accent/50 rounded-xl h-12"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            </div>

            {/* Filter Tabs */}
            <Tabs 
              defaultValue="trending" 
              value={selectedFilter}
              onValueChange={(val) => setSelectedFilter(val as TrendingFilter)}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 mb-4 bg-black/30 p-1 rounded-xl w-full">
                <TabsTrigger 
                  value="trending" 
                  className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent rounded-lg flex items-center gap-2 text-xs sm:text-sm"
                >
                  <Flame className="h-4 w-4" /> 
                  <span className="hidden sm:inline">Trending</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="recent" 
                  className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent rounded-lg flex items-center gap-2 text-xs sm:text-sm"
                >
                  <Clock className="h-4 w-4" /> 
                  <span className="hidden sm:inline">Recent</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="creators" 
                  className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent rounded-lg flex items-center gap-2 text-xs sm:text-sm"
                >
                  <Award className="h-4 w-4" /> 
                  <span className="hidden sm:inline">Creators</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* User List - Scrollable */}
            <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Card key={i} className="p-4 bg-black/30 border border-accent/10">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-accent/5" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-accent/10 rounded w-1/4" />
                          <div className="h-3 bg-accent/5 rounded w-3/4" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : searchResults?.length ? (
                searchResults.map((user) => (
                  <Card 
                    key={user.id} 
                    className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-[0_0_15px_rgba(249,115,22,0.15)] ${
                      selectedUser?.id === user.id ? 'border-accent bg-accent/10' : 'bg-black/30 border-accent/10'
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-accent/30 flex-shrink-0">
                        <AvatarImage src={user.avatar_url || ''} />
                        <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 flex-wrap">
                          <h3 className="font-bold text-base truncate">@{user.username}</h3>
                          {user.user_subscriptions?.[0]?.subscription_tiers && (
                            <Badge className="ml-1 text-xs py-0 px-1.5" style={{ backgroundColor: user.user_subscriptions[0].subscription_tiers.checkmark_color }}>
                              {user.user_subscriptions[0].subscription_tiers.name}
                            </Badge>
                          )}
                        </div>
                        {user.bio && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{user.bio}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-xs flex-wrap">
                          <div className="flex items-center gap-1 font-medium">
                            <Flame className="h-3.5 w-3.5 text-orange-500" />
                            <span className="text-orange-500">#{user.trendingRank}</span>
                          </div>
                          <div className="flex items-center gap-1 text-emerald-400">
                            <span>+{user.followerGrowth}</span>
                          </div>
                          <div className="bg-accent/10 text-xs px-1.5 py-0.5 rounded">
                            +{user.weeklyGrowthPercent}%
                          </div>
                        </div>
                      </div>
                      {session?.user?.id && session.user.id !== user.id && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            followingData ? handleUnfollow(user.id) : handleFollow(user.id);
                          }}
                          className="bg-accent/20 hover:bg-accent/40 border-accent text-white hover:text-white h-8 text-xs flex-shrink-0"
                        >
                          {followingData ? 'Following' : 'Follow'}
                        </Button>
                      )}
                    </div>
                  </Card>
                ))
              ) : searchQuery ? (
                <Card className="p-8 text-center bg-black/30 border-accent/10">
                  <p className="text-muted-foreground">No users found matching "{searchQuery}"</p>
                </Card>
              ) : (
                <Card className="p-8 text-center bg-black/30 border-accent/10">
                  <p className="text-muted-foreground">Select a filter or search for trending creators</p>
                </Card>
              )}
            </div>
          </div>

          {/* Right Section - User Preview */}
          <div className="flex flex-col min-h-0">
            {selectedUser ? (
              <Card className="flex-1 p-6 bg-black/30 backdrop-blur-lg border-accent/20 overflow-hidden">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                    <Avatar className="h-16 w-16 border-2 border-accent/50 flex-shrink-0">
                      <AvatarImage src={selectedUser?.avatar_url || ''} />
                      <AvatarFallback>{selectedUser?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h2 className="text-xl font-bold truncate">@{selectedUser?.username}</h2>
                        {selectedUser?.user_subscriptions?.[0]?.subscription_tiers && (
                          <Badge style={{ backgroundColor: selectedUser.user_subscriptions[0].subscription_tiers.checkmark_color }}>
                            {selectedUser.user_subscriptions[0].subscription_tiers.name}
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm line-clamp-2">{selectedUser?.bio || "No bio available"}</p>
                    </div>
                    
                    <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 flex-shrink-0">
                      {session?.user?.id && selectedUser && session?.user?.id !== selectedUser?.id && (
                        <>
                          <Button 
                            variant="default"
                            onClick={() => followingData ? handleUnfollow(selectedUser.id) : handleFollow(selectedUser.id)}
                            className="bg-accent hover:bg-accent/80 text-sm h-9"
                          >
                            {followingData ? 'Unfollow' : 'Follow'}
                          </Button>
                          <Button variant="outline" size="sm" className="bg-transparent text-sm h-9">
                            Message
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-8"
                            disabled={blockedUserIds?.includes(selectedUser.id) ? isUnblocking : isBlocking}
                            onClick={() => blockedUserIds?.includes(selectedUser.id) 
                              ? handleUnblockUser(selectedUser.id)
                              : handleBlockUser(selectedUser.id)
                            }
                          >
                            {blockedUserIds?.includes(selectedUser.id) ? 'Unblock' : 'Block'}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-black/20 p-3 rounded-lg text-center">
                      <p className="text-xl font-bold">{selectedUser?.follower_count || 0}</p>
                      <p className="text-xs text-muted-foreground">Followers</p>
                    </div>
                    <div className="bg-black/20 p-3 rounded-lg text-center">
                      <p className="text-xl font-bold">{selectedUser?.total_posts || 0}</p>
                      <p className="text-xs text-muted-foreground">Posts</p>
                    </div>
                    <div className="bg-black/20 p-3 rounded-lg text-center">
                      <p className="text-xl font-bold">{selectedUser?.total_likes_received || 0}</p>
                      <p className="text-xs text-muted-foreground">Likes</p>
                    </div>
                    <div className="bg-black/20 p-3 rounded-lg text-center">
                      <p className="text-xl font-bold">{selectedUser?.total_views || 0}</p>
                      <p className="text-xs text-muted-foreground">Views</p>
                    </div>
                  </div>

                  {/* Additional info */}
                  <div className="flex flex-wrap gap-4 items-center mb-6 text-xs text-muted-foreground">
                    {selectedUser?.created_at && (
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-3.5 w-3.5" />
                        <span>Joined {format(new Date(selectedUser.created_at), 'MMM yyyy')}</span>
                      </div>
                    )}
                    {selectedUser?.location && (
                      <div className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5" />
                        <span>{selectedUser.location}</span>
                      </div>
                    )}
                    {selectedUser?.trendingRank && (
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-3.5 w-3.5 text-orange-500" />
                        <span className="text-orange-500">Trending #{selectedUser.trendingRank}</span>
                      </div>
                    )}
                  </div>

                  {/* Content tabs - Scrollable */}
                  <div className="flex-1 min-h-0">
                    <Tabs defaultValue="posts" className="h-full flex flex-col">
                      <TabsList className="bg-black/30 border-b border-accent/10 rounded-t-lg rounded-b-none p-0 h-auto w-full justify-start flex-shrink-0">
                        <TabsTrigger 
                          value="posts" 
                          className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:text-accent p-3"
                        >
                          Latest Posts
                        </TabsTrigger>
                        <TabsTrigger 
                          value="videos" 
                          className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:text-accent p-3"
                        >
                          Videos
                        </TabsTrigger>
                      </TabsList>
                      
                      <div className="flex-1 overflow-y-auto mt-4">
                        <TabsContent value="posts" className="mt-0 h-full">
                          {userPosts && userPosts.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {userPosts.map((post) => (
                                <Card key={post.id} className="bg-black/20 p-4 overflow-hidden border-accent/10">
                                  <p className="line-clamp-3 text-sm">{post.content}</p>
                                  {post.media_urls && post.media_urls.length > 0 && (
                                    <div className="mt-3 h-32 w-full relative rounded-md overflow-hidden">
                                      <img 
                                        src={post.media_urls[0]} 
                                        alt="Post media" 
                                        className="h-full w-full object-cover"
                                      />
                                    </div>
                                  )}
                                  <div className="mt-3 flex justify-between items-center">
                                    <div className="text-xs text-muted-foreground">
                                      {new Date(post.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center text-xs text-muted-foreground gap-3">
                                      <span>❤️ {post.post_likes?.length || 0}</span>
                                      <span>💬 {post.comments?.length || 0}</span>
                                    </div>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <p className="text-center text-muted-foreground py-8">No posts available</p>
                          )}
                        </TabsContent>
                        
                        <TabsContent value="videos" className="mt-0 h-full">
                          {userVideos && userVideos.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {userVideos.map((video) => (
                                <Card key={video.id} className="bg-black/20 border-accent/10 overflow-hidden">
                                  <div className="h-40 relative">
                                    <img 
                                      src={video.thumbnail_url} 
                                      alt={video.title} 
                                      className="h-full w-full object-cover"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                                      <p className="font-medium line-clamp-1 text-sm">{video.title}</p>
                                    </div>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          ) : (
                            <p className="text-center text-muted-foreground py-8">No videos available</p>
                          )}
                        </TabsContent>
                      </div>
                    </Tabs>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="flex-1 flex items-center justify-center bg-black/30 border-accent/10">
                <div className="text-center p-8">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="text-muted-foreground">Select a user to view their profile</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Followers;
