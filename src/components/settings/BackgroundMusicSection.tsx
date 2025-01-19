import { useState } from "react";
import { useBackgroundMusic } from "@/hooks/useBackgroundMusic";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Music, Upload } from "lucide-react";

export const BackgroundMusicSection = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { isPlaying, volume, togglePlay, setVolume } = useBackgroundMusic();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file duration
    const audio = new Audio(URL.createObjectURL(file));
    await new Promise((resolve) => {
      audio.addEventListener('loadedmetadata', resolve);
    });

    if (audio.duration > 360) { // 6 minutes
      toast.error("Music must be less than 6 minutes long");
      return;
    }

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('background-music')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('background-music')
        .getPublicUrl(fileName);

      // Save to database
      const { error: dbError } = await supabase
        .from('user_background_music')
        .upsert({
          user_id: user.id,
          music_url: publicUrl,
          title: file.name,
          duration: Math.floor(audio.duration)
        });

      if (dbError) throw dbError;

      toast.success("Background music updated successfully");
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Failed to upload music");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Background Music</h3>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={togglePlay}
            className="h-8 w-8"
          >
            <Music className="h-4 w-4" />
          </Button>
          <label className="cursor-pointer">
            <Input
              type="file"
              className="hidden"
              accept="audio/*"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <div className="flex items-center gap-2">
              <Button variant="outline" disabled={isUploading}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Music
              </Button>
            </div>
          </label>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Volume</label>
        <Slider
          value={[volume * 100]}
          onValueChange={(value) => setVolume(value[0] / 100)}
          max={100}
          step={1}
        />
      </div>
    </div>
  );
};