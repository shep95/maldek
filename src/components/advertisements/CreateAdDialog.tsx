import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Video, Upload, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CreateAdDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateAdDialog = ({ isOpen, onOpenChange }: CreateAdDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [targetUrl, setTargetUrl] = useState("");
  const [dailyBudget, setDailyBudget] = useState(50);
  const [isUploading, setIsUploading] = useState(false);

  const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';
      
      videoElement.onloadedmetadata = () => {
        const duration = Math.round(videoElement.duration);
        if (duration > 30) {
          toast.error("Video must be 30 seconds or less");
          return;
        }
        setVideoFile(file);
        toast.success("Video selected");
      };
      
      videoElement.src = URL.createObjectURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!videoFile || !title.trim() || !description.trim() || !targetUrl.trim()) {
      toast.error("Please fill in all fields and select a video");
      return;
    }

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to create advertisements");
        return;
      }

      // Upload video
      const videoPath = `${user.id}/${Date.now()}_${videoFile.name}`;
      const { error: videoError } = await supabase.storage
        .from('videos')
        .upload(videoPath, videoFile);
      if (videoError) throw videoError;

      // Get video URL
      const videoUrl = supabase.storage.from('videos').getPublicUrl(videoPath).data.publicUrl;

      // Create advertisement record
      const { data: ad, error: adError } = await supabase.from('advertisements').insert({
        user_id: user.id,
        title,
        description,
        video_url: videoUrl,
        target_url: targetUrl,
        duration: 30,
        budget: dailyBudget,
        daily_budget: dailyBudget
      }).select().single();

      if (adError) throw adError;

      // Create Stripe checkout session
      const { data: sessionData, error: sessionError } = await supabase.functions.invoke('create-ad-payment', {
        body: { dailyBudget, userId: user.id, adId: ad.id }
      });

      if (sessionError) throw sessionError;

      // Redirect to Stripe checkout
      window.location.href = sessionData.url;

    } catch (error) {
      console.error('Error creating advertisement:', error);
      toast.error("Failed to create advertisement");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create Advertisement</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              placeholder="Advertisement Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Advertisement Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Target URL</Label>
            <Input
              placeholder="https://example.com"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Daily Budget (USD)</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[dailyBudget]}
                onValueChange={(value) => setDailyBudget(value[0])}
                max={1000}
                min={10}
                step={10}
                className="flex-1"
              />
              <span className="min-w-[60px] text-right">${dailyBudget}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              You will be charged $1.00 per click, up to your daily budget
            </p>
          </div>

          <div className="space-y-2">
            <Input
              type="file"
              accept="video/*"
              onChange={handleVideoSelect}
              className="hidden"
              id="video-upload"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById("video-upload")?.click()}
              className="w-full gap-2"
            >
              <Video className="h-4 w-4" />
              Select Video (Max 30s)
            </Button>
            {videoFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {videoFile.name}
              </p>
            )}
          </div>

          <Button 
            onClick={handleSubmit} 
            className="w-full gap-2"
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Upload className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <DollarSign className="h-4 w-4" />
                Create Advertisement
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};