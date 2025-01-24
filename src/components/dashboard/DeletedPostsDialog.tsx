import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PostCard } from "./PostCard";
import { useSession } from "@supabase/auth-helpers-react";
import { Skeleton } from "@/components/ui/skeleton";

export function DeletedPostsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const session = useSession();
  const [usernameFilter, setUsernameFilter] = useState("");

  const { data: deletedPosts, isLoading } = useQuery({
    queryKey: ["deleted-posts", usernameFilter],
    queryFn: async () => {
      console.log("Fetching deleted posts with username filter:", usernameFilter);
      let query = supabase
        .from("posts")
        .select(`
          *,
          profiles:user_id (*),
          post_likes:post_likes(*),
          bookmarks:bookmarks(*),
          comments:comments(*)
        `)
        .eq("is_deleted", true)
        .order("deleted_at", { ascending: false });

      if (usernameFilter) {
        query = query.textSearch("profiles.username", usernameFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Deleted Posts</DialogTitle>
        </DialogHeader>
        
        <Input
          placeholder="Filter by username..."
          value={usernameFilter}
          onChange={(e) => setUsernameFilter(e.target.value)}
          className="mb-4"
        />

        <ScrollArea className="h-[60vh]">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-xl border border-border">
                  <Skeleton className="h-20 w-full" />
                </div>
              ))}
            </div>
          ) : deletedPosts && deletedPosts.length > 0 ? (
            <div className="space-y-4">
              {deletedPosts.map((post) => (
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
                    likes: post.likes || 0,
                    reposts: post.reposts || 0,
                    isLiked: post.post_likes?.some(like => like.id) || false,
                    isBookmarked: post.bookmarks?.some(bookmark => bookmark.id) || false
                  }}
                  currentUserId={session?.user?.id || ""}
                  onPostAction={() => {}}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No deleted posts found
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}