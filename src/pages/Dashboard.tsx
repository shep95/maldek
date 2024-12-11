import { Home, MessageCircle, Bell, Video, User, Settings, LogOut, Plus, Image, FileVideo, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerFooter } from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);

  const navItems = [
    { icon: Home, label: "Home", active: true },
    { icon: MessageCircle, label: "Messages" },
    { icon: Bell, label: "Notifications" },
    { icon: Video, label: "Videos" },
    { icon: User, label: "Profile" },
    { 
      icon: Plus, 
      label: "Create Post",
      onClick: () => setIsCreatingPost(true),
      className: "bg-accent hover:bg-accent/90 text-white"
    },
  ];

  const bottomNavItems = [
    { icon: Settings, label: "Settings" },
    { icon: LogOut, label: "Logout", onClick: () => {
      console.log("Logging out...");
      navigate("/auth");
    }},
  ];

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

  // Mobile Bottom Navigation
  const MobileNav = () => (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0d0d0d] border-t border-muted p-2 md:hidden">
      <div className="flex justify-around items-center">
        {navItems.slice(0, 5).map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            size="icon"
            onClick={item.onClick}
            className={cn(
              "text-muted-foreground",
              item.active && "text-accent"
            )}
          >
            <item.icon className="h-5 w-5" />
          </Button>
        ))}
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden md:block fixed left-0 h-screen p-4">
        <Card className="h-[90vh] w-64 flex flex-col justify-between border-muted bg-[#0d0d0d] backdrop-blur-sm">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-8">
              <h2 className="text-2xl font-bold text-accent">Maldek</h2>
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://github.com/shadcn.png" alt="Profile" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  onClick={item.onClick}
                  className={cn(
                    "w-full justify-start gap-4 hover:bg-accent hover:text-white transition-all",
                    item.active && "bg-accent/10 text-accent",
                    item.className
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>
          
          <div className="p-4 mt-auto border-t border-muted">
            <nav className="space-y-2">
              {bottomNavItems.map((item) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  onClick={item.onClick}
                  className="w-full justify-start gap-4 hover:bg-accent hover:text-white transition-all"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>
        </Card>
      </div>

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
          {/* Content placeholder */}
          <Card className="border border-muted bg-card/50 backdrop-blur-sm p-6">
            <p className="text-muted-foreground">Your feed will appear here...</p>
          </Card>
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
};

export default Dashboard;