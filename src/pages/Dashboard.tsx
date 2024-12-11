import { Image, Send, AtSign } from "lucide-react";
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

const Dashboard = () => {
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mentionedUser, setMentionedUser] = useState("");
  const [posts, setPosts] = useState<Array<{
    content: string;
    timestamp: Date;
    mentions?: string[];
    mediaUrls?: string[];
  }>>([]);

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
    
    // Extract mentions from content
    const mentions = postContent.match(/@(\w+)/g)?.map(m => m.slice(1)) || [];
    
    const newPost = {
      content: postContent,
      timestamp: new Date(),
      mentions,
      mediaUrls: mediaFiles.map(file => URL.createObjectURL(file)), // In a real app, these would be uploaded to storage
    };
    
    setPosts(prevPosts => [newPost, ...prevPosts]);
    console.log("Creating post:", newPost);
    
    setPostContent("");
    setMediaFiles([]);
    setIsCreatingPost(false);
    
    toast.success("Post created successfully!");
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

      {/* Main Content */}
      <main className="flex-1 p-4 md:ml-72 lg:mr-96 md:p-8 pb-20 md:pb-8">
        <div className="max-w-3xl mx-auto animate-fade-in">
          <h1 className="text-3xl font-bold mb-8">Home</h1>
          {posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post, index) => (
                <Card key={index} className="border border-muted bg-card/50 backdrop-blur-sm p-6">
                  <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
                  {post.mediaUrls && post.mediaUrls.length > 0 && (
                    <div className="mt-4 grid gap-2 grid-cols-1 sm:grid-cols-2">
                      {post.mediaUrls.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt={`Post media ${i + 1}`}
                          className="rounded-md max-h-64 w-full object-cover"
                        />
                      ))}
                    </div>
                  )}
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