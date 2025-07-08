import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Music, X, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface MusicUploadProps {
  onUploadComplete?: () => void;
}

export const MusicUpload = ({ onUploadComplete }: MusicUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const session = useSession();
  const queryClient = useQueryClient();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('audio/')) {
        setSelectedFile(file);
        if (!title) {
          setTitle(file.name.replace(/\.[^/.]+$/, ""));
        }
      } else {
        toast.error("Please select an audio file");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('audio/')) {
        setSelectedFile(file);
        if (!title) {
          setTitle(file.name.replace(/\.[^/.]+$/, ""));
        }
      } else {
        toast.error("Please select an audio file");
      }
    }
  };

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        resolve(audio.duration);
      };
      audio.onerror = () => {
        resolve(0); // Default duration if we can't read it
      };
      audio.src = URL.createObjectURL(file);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile || !session?.user?.id || !title.trim()) {
      toast.error("Please select a file and enter a title");
      return;
    }

    setIsUploading(true);

    try {
      // Get audio duration
      const duration = await getAudioDuration(selectedFile);

      // Generate unique filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;

      // Upload file to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('background-music')
        .upload(fileName, selectedFile);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('background-music')
        .getPublicUrl(fileName);

      // Get current playlist count for ordering
      const { count } = await supabase
        .from('user_background_music')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id);

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('user_background_music')
        .insert({
          user_id: session.user.id,
          title: title.trim(),
          music_url: urlData.publicUrl,
          duration: Math.round(duration),
          playlist_order: (count || 0) + 1
        });

      if (dbError) {
        // If database insert fails, clean up the uploaded file
        await supabase.storage
          .from('background-music')
          .remove([fileName]);
        throw dbError;
      }

      // Invalidate the background music query to refresh the list
      await queryClient.invalidateQueries({ queryKey: ['background-music'] });

      toast.success("Music uploaded successfully!");
      
      // Reset form
      setSelectedFile(null);
      setTitle("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      onUploadComplete?.();

    } catch (error) {
      console.error('Error uploading music:', error);
      toast.error("Failed to upload music. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setTitle("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-accent bg-accent/10' 
            : 'border-muted-foreground/25 hover:border-accent/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Music className="h-8 w-8 text-accent" />
              <span className="text-lg font-medium">{selectedFile.name}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearSelection}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <p className="text-lg font-medium">Upload Music</p>
              <p className="text-sm text-muted-foreground">
                Drag and drop an audio file here, or click to browse
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              Choose File
            </Button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Title Input */}
      {selectedFile && (
        <div className="space-y-2">
          <Label htmlFor="title">Track Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter track title"
            disabled={isUploading}
          />
        </div>
      )}

      {/* Upload Button */}
      {selectedFile && (
        <Button 
          onClick={handleUpload} 
          disabled={isUploading || !title.trim()}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            'Upload Music'
          )}
        </Button>
      )}
    </div>
  );
};