import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Video, Upload, DollarSign, Calendar } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

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
  const [campaignDuration, setCampaignDuration] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");

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
    if (!videoFile || !title.trim() || !description.trim() || !targetUrl.trim() || !startDate || !startTime) {
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

      // Convert start date and time to UTC timestamp
      const startDateTime = new Date(`${startDate}T${startTime}`);
      console.log('Campaign start time (local):', startDateTime);

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
        budget: dailyBudget * campaignDuration,
        daily_budget: dailyBudget,
        campaign_start_time: startDateTime.toISOString(),
        campaign_duration_days: campaignDuration
      }).select().single();

      if (adError) throw adError;

      // Create Stripe checkout session
      const { data: sessionData, error: sessionError } = await supabase.functions.invoke('create-ad-payment', {
        body: { 
          dailyBudget, 
          userId: user.id, 
          adId: ad.id,
          campaignDuration
        }
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
            <Label>Campaign Duration (Days)</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[campaignDuration]}
                onValueChange={(value) => setCampaignDuration(value[0])}
                max={30}
                min={1}
                step={1}
                className="flex-1"
              />
              <span className="min-w-[60px] text-right">{campaignDuration} days</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
            <div className="space-y-2">
              <Label>Start Time (EST)</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
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
              Total campaign cost: ${dailyBudget * campaignDuration}
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
                Create Advertisement ({campaignDuration} days: ${dailyBudget * campaignDuration})
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};