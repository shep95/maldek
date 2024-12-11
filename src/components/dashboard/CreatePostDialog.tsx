import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Image, Send, AtSign } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createNewPost } from "@/utils/postUtils";
import type { Author } from "@/utils/postUtils";

interface CreatePostDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: Author;
  onPostCreated: (newPost: any) => void;
}

export const CreatePostDialog = ({
  isOpen,
  onOpenChange,
  currentUser,
  onPostCreated
}: CreatePostDialogProps) => {
  const [postContent, setPostContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mentionedUser, setMentionedUser] = useState("");

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
      onPostCreated(newPost);
      console.log("Creating post:", newPost);
      
      setPostContent("");
      setMediaFiles([]);
      onOpenChange(false);
      
      toast.success("Post created successfully!");
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
  );
};