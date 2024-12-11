import { Image, FileVideo, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerFooter } from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileNav } from "@/components/dashboard/MobileNav";

const Dashboard = () => {
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setMediaFiles(Array.from(files));
      console.log("Files selected:", files);
      toast.success("Media added to post");
    }
  };

  const handleCreatePost = () => {
    if (!postContent.trim() && mediaFiles.length === 0) {
      toast.error("Please add some content to your post");
      return;
    }
    
    console.log("Creating post with content:", postContent);
    console.log("Media files:", mediaFiles);
    
    setPostContent("");
    setMediaFiles([]);
    setIsCreatingPost(false);
    
    toast.success("Post created successfully!");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <Sidebar setIsCreatingPost={setIsCreatingPost} />

      {/* Create Post Drawer */}
      <Drawer open={isCreatingPost} onOpenChange={setIsCreatingPost}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Create a New Post</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 space-y-4">
            <Textarea
              placeholder="What's on your mind?"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="min-h-[120px]"
            />
            <div className="flex gap-2">
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
                <span className="text-sm text-muted-foreground py-2">
                  {mediaFiles.length} file(s) selected
                </span>
              )}
            </div>
          </div>
          <DrawerFooter>
            <Button onClick={handleCreatePost} className="gap-2">
              <Send className="h-4 w-4" />
              Create Post
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <main className="flex-1 p-4 md:ml-72 md:p-8 pb-20 md:pb-8">
        <div className="max-w-3xl mx-auto animate-fade-in">
          <h1 className="text-3xl font-bold mb-8">Home</h1>
          <Card className="border border-muted bg-card/50 backdrop-blur-sm p-6">
            <p className="text-muted-foreground">Your feed will appear here...</p>
          </Card>
        </div>
      </main>

      <MobileNav />
    </div>
  );
};

export default Dashboard;