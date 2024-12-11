import { useState } from "react";
import { PostCard } from "@/components/dashboard/PostCard";
import { CreatePostDialog } from "@/components/dashboard/CreatePostDialog";
import { MediaPreviewDialog } from "@/components/dashboard/MediaPreviewDialog";
import { RightSidebar } from "@/components/dashboard/RightSidebar";
import { usePosts } from "@/hooks/usePosts";
import { toast } from "sonner";
import type { Author } from "@/utils/postUtils";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const { posts, setPosts, isLoading } = usePosts();

  const currentUser: Author = {
    id: "user123",
    name: "John Doe",
    username: "johndoe",
    profilePicture: "https://github.com/shadcn.png"
  };

  const handlePostAction = (postId: string, action: 'like' | 'bookmark' | 'delete' | 'repost') => {
    setPosts(prevPosts => {
      let updatedPosts = prevPosts;
      
      if (action === 'delete') {
        updatedPosts = prevPosts.filter(post => post.id !== postId);
        toast.success("Post deleted successfully!");
      } else {
        updatedPosts = prevPosts.map(post => {
          if (post.id === postId) {
            switch (action) {
              case 'like':
                return {
                  ...post,
                  likes: post.isLiked ? post.likes - 1 : post.likes + 1,
                  isLiked: !post.isLiked
                };
              case 'bookmark':
                return { ...post, isBookmarked: !post.isBookmarked };
              case 'repost':
                return { ...post, reposts: post.reposts + 1 };
              default:
                return post;
            }
          }
          return post;
        });
      }
      
      return updatedPosts;
    });
  };

  const handleUpdatePost = (postId: string, newContent: string) => {
    setPosts(prevPosts => {
      const updatedPosts = prevPosts.map(post => {
        if (post.id === postId) {
          return { ...post, content: newContent };
        }
        return post;
      });
      return updatedPosts;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <CreatePostDialog
        isOpen={isCreatingPost}
        onOpenChange={setIsCreatingPost}
        currentUser={currentUser}
        onPostCreated={(newPost) => setPosts(prevPosts => [newPost, ...prevPosts])}
      />

      <MediaPreviewDialog
        selectedMedia={selectedMedia}
        onClose={() => setSelectedMedia(null)}
      />

      <div className="flex">
        <main className="flex-1 max-w-3xl mx-auto px-4 py-6 md:py-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-8 text-foreground">Home</h1>
          
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 rounded-lg border border-muted bg-card/50 backdrop-blur-sm space-y-4">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-24 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={currentUser.id}
                  onPostAction={handlePostAction}
                  onMediaClick={setSelectedMedia}
                  onUpdatePost={handleUpdatePost}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card/50 backdrop-blur-sm rounded-lg border border-muted">
              <h3 className="text-lg font-medium text-foreground mb-2">No posts yet</h3>
              <p className="text-muted-foreground">
                Be the first to share something with your network!
              </p>
            </div>
          )}
        </main>
        <RightSidebar />
      </div>
    </div>
  );
};

export default Dashboard;