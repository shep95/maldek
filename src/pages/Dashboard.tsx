import { Image, Send, AtSign, Heart, MessageSquare, Share2, Trash2, Bookmark, Maximize, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { RightSidebar } from "@/components/dashboard/RightSidebar";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { AspectRatio } from "@/components/ui/aspect-ratio";

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
  authorId: string; // To check if current user is author
}

const Dashboard = () => {
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mentionedUser, setMentionedUser] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  // Mock current user ID - in real app would come from auth
  const currentUserId = "user123";

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
      authorId: currentUserId,
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
                <Card key={post.id} className="border border-muted bg-card/50 backdrop-blur-sm p-6">
                  <p className="text-foreground whitespace-pre-wrap mb-4">{post.content}</p>
                  {post.mediaUrls && post.mediaUrls.length > 0 && (
                    <div className="mt-4 grid gap-2 grid-cols-1 sm:grid-cols-2">
                      {post.mediaUrls.map((url, i) => (
                        <div key={i} className="relative rounded-lg overflow-hidden cursor-pointer" onClick={() => setSelectedMedia(url)}>
                          {url.endsWith('.mp4') ? (
                            <AspectRatio ratio={16 / 9}>
                              <video
                                src={url}
                                controls
                                className="w-full h-full object-cover rounded-lg"
                              />
                            </AspectRatio>
                          ) : (
                            <AspectRatio ratio={16 / 9}>
                              <img
                                src={url}
                                alt={`Post media ${i + 1}`}
                                className="w-full h-full object-cover rounded-lg hover:opacity-90 transition-opacity"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
                              >
                                <Maximize className="h-4 w-4 text-white" />
                              </Button>
                            </AspectRatio>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`gap-2 ${post.isLiked ? 'text-red-500' : ''}`}
                        onClick={() => handlePostAction(post.id, 'like')}
                      >
                        <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                        {post.likes}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                      >
                        <MessageSquare className="h-4 w-4" />
                        {post.comments}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={() => handlePostAction(post.id, 'repost')}
                      >
                        <Share2 className="h-4 w-4" />
                        {post.reposts}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`gap-2 ${post.isBookmarked ? 'text-blue-500' : ''}`}
                        onClick={() => handlePostAction(post.id, 'bookmark')}
                      >
                        <Bookmark className={`h-4 w-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                    {post.authorId === currentUserId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handlePostAction(post.id, 'delete')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {post.timestamp.toLocaleString()}
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border border-muted bg-card/50 backdrop-blur-sm p-6">
              <p className="text-muted-foreground">Your feed will appear here...</p>
            </Card>
          )}
        </div>
      </main>

      <RightSidebar />
      <MobileNav />
    </div>
  );
};

export default Dashboard;