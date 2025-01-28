import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { Search } from "lucide-react";

const Followers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const session = useSession();

  const { data: searchResults, isLoading } = useQuery({
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

  const handleFollow = async (userId: string) => {
    try {
      if (!session?.user?.id) {
        toast.error("Please sign in to follow users");
        return;
      }

      if (session.user.id === userId) {
        toast.error("You cannot follow yourself");
        return;
      }

      console.log('Following user:', userId);
      
      // First check if already following
      const { data: existingFollow } = await supabase
        .from('followers')
        .select('*')
        .eq('follower_id', session.user.id)
        .eq('following_id', userId)
        .single();

      if (existingFollow) {
        toast.error("You are already following this user");
        return;
      }

      // Insert the follow relationship
      const { error: followError } = await supabase
        .from('followers')
        .insert({
          follower_id: session.user.id,
          following_id: userId
        });

      if (followError) {
        console.error("Follow error:", followError);
        toast.error("Failed to follow user");
        return;
      }

      toast.success("Successfully followed user");
    } catch (error) {
      console.error("Error following user:", error);
      toast.error("Failed to follow user");
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-6">
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
            <Card key={user.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar_url || ''} />
                    <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
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
                </div>
                {session?.user?.id !== user.id && (
                  <Button 
                    variant="outline"
                    onClick={() => handleFollow(user.id)}
                    className="ml-4"
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
          <p className="text-center text-muted-foreground">Search for users to follow</p>
        )}
      </div>
    </div>
  );
};

export default Followers;