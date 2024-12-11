import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { RightSidebar } from "@/components/dashboard/RightSidebar";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { PostCard } from "@/components/dashboard/PostCard";
import { CreatePostDialog } from "@/components/dashboard/CreatePostDialog";
import { MediaPreviewDialog } from "@/components/dashboard/MediaPreviewDialog";
import { usePosts } from "@/hooks/usePosts";
import { toast } from "sonner";
import type { Author } from "@/utils/postUtils";

const Dashboard = () => {
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const { posts, setPosts } = usePosts();

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
          return {
            ...post,
            content: newContent
          };
        }
        return post;
      });
      return updatedPosts;
    });
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar setIsCreatingPost={setIsCreatingPost} />

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

      <main className="flex-1 p-4 md:ml-72 lg:mr-96 md:p-8 pb-20 md:pb-8">
        <div className="max-w-3xl mx-auto animate-fade-in">
          <h1 className="text-3xl font-bold mb-8">Home</h1>
          {posts.length > 0 ? (
            <div className="space-y-4">
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
            <div className="text-center text-muted-foreground p-8">
              No posts yet. Be the first to share something!
            </div>
          )}
        </div>
      </main>

      <RightSidebar />
      <MobileNav />
    </div>
  );
};

export default Dashboard;