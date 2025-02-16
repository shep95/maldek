import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Send, X, CalendarIcon } from "lucide-react";
import { EnhancedUploadZone } from "./post/upload/EnhancedUploadZone";
import { RichTextEditor } from "./post/editor/RichTextEditor";
import { format } from "date-fns";
import { usePostCreation } from "./post/hooks/usePostCreation";
import type { CreatePostDialogProps } from "./post/types/postTypes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { validateMediaFile } from "@/utils/mediaUtils";

export const CreatePostDialog = ({
  isOpen,
  onOpenChange,
  currentUser,
  onPostCreated
}: CreatePostDialogProps) => {
  const {
    content,
    setContent,
    mediaFiles,
    isSubmitting,
    uploadProgress,
    postsRemaining,
    scheduledDate,
    setScheduledDate,
    handleFileSelect,
    handlePaste,
    saveToDrafts,
    createPost,
    resetFormState
  } = usePostCreation(currentUser, onPostCreated, onOpenChange);

  const [isStory, setIsStory] = useState(false);
  const [showDateInput, setShowDateInput] = useState(false);

  const handleFileSelectWithValidation = async (files: FileList) => {
    try {
      if (isStory) {
        for (const file of Array.from(files)) {
          if (file.type.startsWith('video/')) {
            const video = document.createElement('video');
            video.preload = 'metadata';

            await new Promise((resolve, reject) => {
              video.onloadedmetadata = () => resolve(true);
              video.onerror = () => reject();
              video.src = URL.createObjectURL(file);
            });

            if (video.duration > 30) {
              toast.error("Story videos must be 30 seconds or less");
              return;
            }
          }
        }
      }

      handleFileSelect(files);
    } catch (error) {
      console.error('Error handling file selection:', error);
      toast.error("Failed to process selected files");
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (content.trim()) {
      saveToDrafts();
    }
    
    console.log('Cancelling post creation');
    resetFormState();
    onOpenChange(false);
  };

  const handleCreateContent = async () => {
    if (isStory) {
      try {
        const results = await Promise.all(mediaFiles.map(async (file) => {
          const validation = await validateMediaFile(file, currentUser.id);
          if (!validation.isValid) {
            throw new Error(validation.error);
          }

          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}_${crypto.randomUUID()}.${fileExt}`;
          const filePath = `${currentUser.id}/${fileName}`;
          
          console.log('Uploading story to path:', filePath);
          
          const { error: uploadError } = await supabase.storage
            .from('stories')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            throw new Error('Failed to upload story media');
          }

          const { data: { publicUrl } } = supabase.storage
            .from('stories')
            .getPublicUrl(filePath);

          // Create story record
          const { error: storyError } = await supabase
            .from('stories')
            .insert({
              user_id: currentUser.id,
              media_url: publicUrl,
              media_type: file.type.startsWith('video/') ? 'video' : 'image',
              duration: file.type.startsWith('video/') ? 30 : 5 // 5 seconds for images, up to 30 for videos
            });

          if (storyError) {
            console.error('Story creation error:', storyError);
            throw new Error('Failed to create story record');
          }

          return publicUrl;
        }));

        console.log('Successfully created stories:', results);
        toast.success("Story created successfully!");
        onOpenChange(false);
        resetFormState();
      } catch (error: any) {
        console.error('Error creating story:', error);
        toast.error(error.message || "Failed to create story");
      }
    } else {
      await createPost();
    }
  };

  const handleMention = async (username: string) => {
    try {
      const { data: mentionedUser, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();

      if (userError || !mentionedUser) {
        console.error('Error finding mentioned user:', userError);
        return;
      }

      console.log('Mentioned user found:', mentionedUser);
      setContent(prev => `${prev}@${username} `);
    } catch (error) {
      console.error('Error handling mention:', error);
      toast.error("Failed to process mention");
    }
  };

  const handleManualDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputDate = new Date(e.target.value);
    if (!isNaN(inputDate.getTime())) {
      setScheduledDate(inputDate);
    }
  };

  const toggleDateInput = () => {
    setShowDateInput(!showDateInput);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] bg-card">
        <DialogHeader>
          <DialogTitle>Create a New Post</DialogTitle>
          <DialogDescription className="flex flex-col gap-1">
            Share your thoughts, media, or mention other users in your post.
            {postsRemaining !== null && (
              <span className="text-sm text-muted-foreground">
                You have {postsRemaining} {postsRemaining === 1 ? 'post' : 'posts'} remaining this hour.
                <Button 
                  variant="link" 
                  className="text-accent px-1 h-auto"
                  onClick={() => window.location.href = '/subscription'}
                >
                  Upgrade for unlimited posts
                </Button>
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="story-mode"
              checked={isStory}
              onCheckedChange={setIsStory}
            />
            <Label htmlFor="story-mode">Post as Story</Label>
          </div>

          {!isStory && (
            <RichTextEditor
              value={content}
              onChange={setContent}
              onMention={handleMention}
              onHashtag={(tag) => setContent(prev => `${prev}#${tag} `)}
            />
          )}
          
          <EnhancedUploadZone
            onFileSelect={handleFileSelectWithValidation}
            onPaste={handlePaste}
            isUploading={isSubmitting}
            uploadProgress={uploadProgress}
            accept={isStory ? "image/*,video/mp4,video/quicktime,video/webm" : undefined}
          />

          {!isStory && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleDateInput}
                >
                  {showDateInput ? "Use Calendar" : "Type Date"}
                </Button>
                
                {showDateInput ? (
                  <Input
                    type="datetime-local"
                    value={scheduledDate ? format(scheduledDate, "yyyy-MM-dd'T'HH:mm") : ""}
                    onChange={handleManualDateInput}
                    className="flex-1"
                    min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                  />
                ) : (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          !scheduledDate && "text-muted-foreground"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {scheduledDate ? format(scheduledDate, "PPP") : "Schedule post"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={scheduledDate}
                        onSelect={setScheduledDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              
              {scheduledDate && (
                <p className="text-sm text-muted-foreground">
                  Post will be published on {format(scheduledDate, "PPP 'at' h:mm a")}
                </p>
              )}
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              onClick={handleCancel}
              variant="outline"
              className="w-full gap-2"
              type="button"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button 
              onClick={handleCreateContent} 
              className="w-full gap-2"
              disabled={isSubmitting}
              type="button"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Creating...' : isStory ? 'Create Story' : scheduledDate ? 'Schedule' : 'Create Post'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
