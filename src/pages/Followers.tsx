import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "@/components/dashboard/PostCard";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const Followers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const session = useSession();

  // Query to check if the current user is following a specific user
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

      if (error && error.code !== 'PGRST116') { // PGRST116 is the "no rows returned" error
        console.error('Error checking follow status:', error);
        throw error;
      }

      return data;
    },
    enabled: !!session?.user?.id && !!selectedUser?.id,
  });

  // Add refetch to searchResults query
  const { data: searchResults, isLoading, refetch: refetchSearch } = useQuery({
    queryKey: ['user-search', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];

      console.log('Searching for users:', searchQuery);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${searchQuery}%`)
        .limit(10);

      if (error) {
        console.error('Error searching users:', error);
        throw error;
      }

      console.log('Search results:', data);
      return data;
    },
    enabled: searchQuery.length > 0
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
        .order('created_at', { ascending: false });

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
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!selectedUser?.id
  });

  const { data: userMedia } = useQuery({
    queryKey: ['user-media', selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser?.id) return [];
      
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', selectedUser.id)
        .not('media_urls', 'eq', '{}')
        .order('created_at', { ascending: false });

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
        if (error.code === '23505') { // Unique violation
          toast.error("You are already following this user");
          return;
        }
        throw error;
      }

      toast.success("Successfully followed user");
      refetchFollowing(); // Refresh following status
      refetchSearch(); // Refresh the search results to update follower count
      
      // If the user is currently selected in the dialog, update their data
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
      refetchFollowing(); // Refresh following status
      refetchSearch(); // Refresh the search results to update follower count
      
      // If the user is currently selected in the dialog, update their data
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

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-6 text-center md:text-left">User Info</h1>
      <div className="relative">
        <Input
          type="text"
          placeholder="Search users by username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : searchResults?.length ? (
          searchResults.map((user) => (
            <Card 
              key={user.id} 
              className="p-4 cursor-pointer hover:bg-accent/10 transition-colors"
              onClick={() => setSelectedUser(user)}
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar_url || ''} />
                  <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">@{user.username}</h3>
                  <div className="text-sm text-muted-foreground space-x-3">
                    <span>{user.follower_count} followers</span>
                    <span>•</span>
                    <span>{user.total_posts || 0} posts</span>
                  </div>
                  {user.bio && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{user.bio}</p>
                  )}
                </div>
                {session?.user?.id !== user.id && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFollow(user.id);
                    }}
                    className="ml-2"
                  >
                    Follow
                  </Button>
                )}
              </div>
            </Card>
          ))
        ) : searchQuery ? (
          <p className="text-center text-muted-foreground">No users found</p>
        ) : (
          <p className="text-center text-muted-foreground">Search for users to view their profile</p>
        )}
      </div>

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="sm:max-w-[600px] bg-background/80 backdrop-blur-lg border-none">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={selectedUser?.avatar_url || ''} />
              <AvatarFallback>{selectedUser?.username[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">@{selectedUser?.username}</h2>
              <p className="text-muted-foreground">{selectedUser?.bio}</p>
              <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                <span>{selectedUser?.follower_count} followers</span>
                <span>{selectedUser?.total_posts || 0} posts</span>
              </div>
            </div>
            {session?.user?.id !== selectedUser?.id && (
              <Button 
                variant="outline"
                onClick={() => followingData ? 
                  handleUnfollow(selectedUser.id) : 
                  handleFollow(selectedUser.id)
                }
              >
                {followingData ? 'Unfollow' : 'Follow'}
              </Button>
            )}
          </div>

          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="posts" className="flex-1">Posts</TabsTrigger>
              <TabsTrigger value="media" className="flex-1">Media</TabsTrigger>
              <TabsTrigger value="videos" className="flex-1">Videos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="posts" className="mt-4 max-h-[400px] overflow-y-auto">
              {userPosts?.length ? (
                <div className="space-y-4">
                  {userPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={{
                        ...post,
                        author: {
                          id: post.profiles.id,
                          username: post.profiles.username,
                          avatar_url: post.profiles.avatar_url,
                          name: post.profiles.username
                        },
                        timestamp: new Date(post.created_at),
                        comments: post.comments?.length || 0,
                        isLiked: post.post_likes?.some(like => like.user_id === session?.user?.id) || false,
                        isBookmarked: post.bookmarks?.some(bookmark => bookmark.user_id === session?.user?.id) || false
                      }}
                      currentUserId={session?.user?.id || ''}
                      onPostAction={() => {}}
                      onMediaClick={() => {}}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">No posts yet</p>
              )}
            </TabsContent>

            <TabsContent value="media" className="mt-4 max-h-[400px] overflow-y-auto">
              {userMedia?.length ? (
                <div className="grid grid-cols-3 gap-2">
                  {userMedia.map((post) => (
                    post.media_urls.map((url: string, index: number) => (
                      <img
                        key={`${post.id}-${index}`}
                        src={url}
                        alt={`Media by ${selectedUser?.username}`}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    ))
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">No media posts yet</p>
              )}
            </TabsContent>

            <TabsContent value="videos" className="mt-4 max-h-[400px] overflow-y-auto">
              {userVideos?.length ? (
                <div className="space-y-4">
                  {userVideos.map((video) => (
                    <div key={video.id} className="rounded-lg overflow-hidden">
                      <video
                        src={video.video_url}
                        controls
                        className="w-full"
                        poster={video.thumbnail_url}
                      >
                        Your browser does not support the video tag.
                      </video>
                      <h3 className="font-semibold mt-2">{video.title}</h3>
                      <p className="text-sm text-muted-foreground">{video.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">No videos yet</p>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Followers;
