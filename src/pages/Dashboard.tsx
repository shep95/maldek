import { Image, Send, AtSign, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { RightSidebar } from "@/components/dashboard/RightSidebar";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { PostCard } from "@/components/dashboard/PostCard";
import { createNewPost, type Post, type Author } from "@/utils/postUtils";
import { isVideoFile } from "@/utils/mediaUtils";

const Dashboard = () => {
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mentionedUser, setMentionedUser] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  const currentUser: Author = {
    id: "user123",
    name: "John Doe",
    username: "johndoe",
    profilePicture: "https://github.com/shadcn.png"
  };

  useEffect(() => {
    const savedPosts = localStorage.getItem('posts');
    if (savedPosts) {
      try {
        const parsedPosts = JSON.parse(savedPosts).map((post: any) => ({
          ...post,
          timestamp: new Date(post.timestamp)
        }));
        setPosts(parsedPosts);
        console.log('Loaded posts from localStorage:', parsedPosts);
      } catch (error) {
        console.error('Error loading posts from localStorage:', error);
        toast.error('Error loading saved posts');
      }
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('posts', JSON.stringify(posts));
      console.log('Saved posts to localStorage:', posts);
    } catch (error) {
      console.error('Error saving posts to localStorage:', error);
      toast.error('Error saving posts');
    }
  }, [posts]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setMediaFiles(fileArray);
      console.log("Files selected:", fileArray);
      toast.success("Media added to post");
    }
  };

  const handleMentionUser = () => {
    if (mentionedUser) {
      setPostContent((prev) => `${prev} @${mentionedUser} `);
      setMentionedUser("");
      console.log("Mentioned user:", mentionedUser);
    }
  };

  const handleCreatePost = async () => {
    if (!postContent.trim() && mediaFiles.length === 0) {
      toast.error("Please add some content to your post");
      return;
    }

    try {
      const newPost = await createNewPost(postContent, mediaFiles, currentUser);
      setPosts(prevPosts => [newPost, ...prevPosts]);
      console.log("Creating post:", newPost);
      
      setPostContent("");
      setMediaFiles([]);
      setIsCreatingPost(false);
      
      toast.success("Post created successfully!");
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    }
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

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar setIsCreatingPost={setIsCreatingPost} />

      <Dialog open={isCreatingPost} onOpenChange={setIsCreatingPost}>
        <DialogContent className="sm:max-w-[525px] bg-card">
          <DialogHeader>
            <DialogTitle>Create a New Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="What's on your mind?"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="min-h-[120px] bg-background"
            />
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Mention a user"
                value={mentionedUser}
                onChange={(e) => setMentionedUser(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleMentionUser}
                className="shrink-0"
              >
                <AtSign className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2 items-center">
              <Input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="media-upload"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById("media-upload")?.click()}
                className="gap-2"
              >
                <Image className="h-4 w-4" />
                Add Media
              </Button>
              {mediaFiles.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {mediaFiles.length} file(s) selected
                </span>
              )}
            </div>
            <Button onClick={handleCreatePost} className="w-full gap-2">
              <Send className="h-4 w-4" />
              Create Post
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="sm:max-w-[90vw] h-[90vh] flex items-center justify-center bg-black/90">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 text-white"
            onClick={() => setSelectedMedia(null)}
          >
            <X className="h-6 w-6" />
          </Button>
          {selectedMedia && isVideoFile(selectedMedia) ? (
            <video
              src={selectedMedia}
              controls
              className="max-h-full max-w-full rounded-lg"
            />
          ) : (
            <img
              src={selectedMedia}
              alt="Full size preview"
              className="max-h-full max-w-full rounded-lg object-contain"
            />
          )}
        </DialogContent>
      </Dialog>

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
