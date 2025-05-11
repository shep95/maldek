
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, X, FileText, Image as ImageIcon, Video, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageFileUploadProps {
  onFileChange: (file: File | null) => void;
  previewUrl: string | null;
  file: File | null;
  onCancel: () => void;
  isUploading: boolean;
}

export const MessageFileUpload = ({
  onFileChange,
  previewUrl,
  file,
  onCancel,
  isUploading,
}: MessageFileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    onFileChange(selectedFile);
  };
  
  const getFileIcon = () => {
    if (!file) return <FileText className="h-6 w-6" />;
    
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="h-6 w-6" />;
    } else if (file.type.startsWith("video/")) {
      return <Video className="h-6 w-6" />;
    } else if (file.type.startsWith("audio/")) {
      return <Mic className="h-6 w-6" />;
    }
    return <FileText className="h-6 w-6" />;
  };

  return (
    <div className="p-4 border-t border-white/10">
      <div className="flex flex-col gap-3">
        {file ? (
          <div className="flex items-center gap-3 p-3 rounded-md bg-black/30">
            {previewUrl && file.type.startsWith("image/") ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="h-16 w-auto rounded"
              />
            ) : (
              <div className="h-12 w-12 bg-black/50 rounded flex items-center justify-center">
                {getFileIcon()}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="text-muted-foreground hover:text-white"
              onClick={() => onFileChange(null)}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center p-6 border border-dashed border-white/10 rounded-md bg-black/30">
            <div className="text-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Paperclip className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p>Click to select a file to send</p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports images, videos, audio and documents
              </p>
              
              <Input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileInputChange}
                disabled={isUploading}
              />
            </div>
          </div>
        )}
        
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isUploading}
            className="border-white/10"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
