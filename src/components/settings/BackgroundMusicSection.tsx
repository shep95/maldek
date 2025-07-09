
import { useState, useRef } from "react";
import { useBackgroundMusicContext } from "@/components/providers/BackgroundMusicProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { 
  Music, 
  Upload, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Repeat, 
  Trash2
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { Database } from "@/integrations/supabase/types";

type BackgroundMusic = Database['public']['Tables']['user_background_music']['Row'];

export const BackgroundMusicSection = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { 
    isPlaying, 
    volume, 
    isLooping,
    togglePlay, 
    toggleLoop,
    setVolume,
    playNext,
    playPrevious,
    deleteTrack,
    currentTrack,
    updatePlaylistOrder,
    playlist
  } = useBackgroundMusicContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { refetch: refetchMusicList } = useQuery({
    queryKey: ['background-music'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_background_music')
        .select('*')
        .eq('user_id', user.id)
        .order('playlist_order', { ascending: true });

      if (error) {
        console.error('Error fetching music:', error);
        return [];
      }

      return data;
    }
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File upload triggered"); // Debug log
    const file = event.target.files?.[0];
    if (!file) {
      console.log("No file selected"); // Debug log
      return;
    }

    // Check file type - only allow web browser compatible audio formats
    const supportedTypes = [
      'audio/mpeg',     // MP3 - Most widely supported
      'audio/wav',      // WAV - Universally supported  
      'audio/ogg',      // OGG - Good modern browser support
      'audio/mp4'       // M4A - Good browser support
    ];
    
    if (!supportedTypes.includes(file.type)) {
      toast.error("Only web-compatible formats supported: MP3, WAV, OGG, M4A");
      return;
    }

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
      console.log("Starting upload process"); // Debug log
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('background-music')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError); // Debug log
        throw uploadError;
      }

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

      if (dbError) {
        console.error('Database error:', dbError); // Debug log
        throw dbError;
      }

      toast.success("Background music updated successfully");
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Failed to upload music");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(playlist);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the playlist_order in the database
    try {
      const updates = items.map((item, index) => ({
        id: item.id,
        user_id: item.user_id,
        music_url: item.music_url,
        title: item.title,
        duration: item.duration,
        playlist_order: index
      }));

      const { error } = await supabase
        .from('user_background_music')
        .upsert(updates);

      if (error) throw error;

      updatePlaylistOrder(items);
      refetchMusicList();
    } catch (error) {
      console.error('Error updating playlist order:', error);
      toast.error("Failed to update playlist order");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Background Music</h3>
        <div className="flex items-center gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
              >
                <Music className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Music Playlist</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={playPrevious}
                    className="h-8 w-8"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={togglePlay}
                    className="h-8 w-8"
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={playNext}
                    className="h-8 w-8"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleLoop}
                    className={`h-8 w-8 ${isLooping ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
                  >
                    <Repeat className="h-4 w-4" />
                  </Button>
                </div>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="music-list">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2"
                      >
                        {playlist.map((track, index) => (
                          <Draggable
                            key={track.id}
                            draggableId={track.id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-2 border rounded-md ${
                                  currentTrack?.id === track.id
                                    ? "bg-primary/10 border-primary"
                                    : "bg-card"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">
                                    {index + 1}.
                                  </span>
                                  <span className="flex-1 truncate">
                                    {track.title}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 hover:text-destructive"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteTrack(track.id);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            </DialogContent>
          </Dialog>
          <div className="cursor-pointer">
            <Input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".mp3,.wav,.ogg,.m4a,audio/mpeg,audio/wav,audio/ogg,audio/mp4"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleUploadClick} disabled={isUploading}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Music
              </Button>
            </div>
          </div>
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
