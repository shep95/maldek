import { Image, Send, AtSign, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { RightSidebar } from "@/components/dashboard/RightSidebar";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { PostCard } from "@/components/dashboard/PostCard";

interface Author {
  id: string;
  name: string;
  username: string;
  profilePicture?: string;
}

interface Post {
  id: string;
  content: string;
  timestamp: Date;
  mentions?: string[];
  mediaUrls?: string[];
  likes: number;
  comments: number;
  reposts: number;
  isLiked: boolean;
  isBookmarked: boolean;
  authorId: string;
  author: Author;
}

const Dashboard = () => {
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mentionedUser, setMentionedUser] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  // Mock current user data - in real app would come from auth
  const currentUser: Author = {
    id: "user123",
    name: "John Doe",
    username: "johndoe",
    profilePicture: "https://github.com/shadcn.png"
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setMediaFiles(Array.from(files));
      console.log("Files selected:", files);
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

  const handleCreatePost = () => {
    if (!postContent.trim() && mediaFiles.length === 0) {
      toast.error("Please add some content to your post");
      return;
    }
    
    const mentions = postContent.match(/@(\w+)/g)?.map(m => m.slice(1)) || [];
    
    const newPost: Post = {
      id: Date.now().toString(),
      content: postContent,
      timestamp: new Date(),
      mentions,
      mediaUrls: mediaFiles.map(file => URL.createObjectURL(file)),
      likes: 0,
      comments: 0,
      reposts: 0,
      isLiked: false,
      isBookmarked: false,
      authorId: currentUser.id,
      author: currentUser,
    };
    
    setPosts(prevPosts => [newPost, ...prevPosts]);
    console.log("Creating post:", newPost);
    
    setPostContent("");
    setMediaFiles([]);
    setIsCreatingPost(false);
    
    toast.success("Post created successfully!");
  };

  const handlePostAction = (postId: string, action: 'like' | 'bookmark' | 'delete' | 'repost') => {
    setPosts(prevPosts => prevPosts.map(post => {
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
    }));

    if (action === 'delete') {
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      toast.success("Post deleted successfully!");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar setIsCreatingPost={setIsCreatingPost} />

      {/* Create Post Dialog */}
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

      {/* Media Preview Dialog */}
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
          {selectedMedia?.endsWith('.mp4') ? (
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

      {/* Main Content */}
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