
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Upload, Lock, File, X, Check, Shield } from "lucide-react";
import { encryptionService } from "@/services/encryptionService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EncryptedFileUploadProps {
  bucketName: string;
  folderPath: string;
  onUploadComplete: (filePath: string, metadata: string, originalFileName: string) => void;
  className?: string;
  accept?: string;
  maxSizeMB?: number;
  buttonText?: string;
}

export const EncryptedFileUpload = ({
  bucketName,
  folderPath,
  onUploadComplete,
  className,
  accept = "*",
  maxSizeMB = 50,
  buttonText = "Upload Encrypted File"
}: EncryptedFileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File too large. Maximum size is ${maxSizeMB}MB`);
      return;
    }
    
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    if (!encryptionService.isInitialized()) {
      toast.error("Encryption service not initialized. Please set up your security code first.");
      return;
    }

    try {
      setIsUploading(true);
      setProgress(10); // Show some initial progress
      
      // Get user ID for the file path
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Update progress to show encryption has started
      setProgress(25);
      
      // Upload the encrypted file
      const result = await encryptionService.uploadEncryptedFile(
        selectedFile,
        bucketName,
        folderPath
      );
      
      if (!result) {
        throw new Error("Failed to upload encrypted file");
      }
      
      setProgress(95);
      
      // Call the onUploadComplete callback
      onUploadComplete(result.filePath, result.metadata, selectedFile.name);
      
      // Clear the selection
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      toast.success("File encrypted and uploaded successfully");
      setProgress(100);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
    } finally {
      // Reset progress after a short delay
      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
      }, 1000);
    }
  };

  const handleCancelUpload = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="border border-dashed border-border rounded-lg p-4 bg-background/50">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept={accept}
          disabled={isUploading}
        />
        
        {!selectedFile ? (
          <div className="flex flex-col items-center justify-center p-4">
            <div className="p-3 bg-accent/10 rounded-full mb-4">
              <Lock className="h-6 w-6 text-accent" />
            </div>
            <p className="text-center text-sm text-muted-foreground mb-4">
              Files will be encrypted before upload using end-to-end encryption
            </p>
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="gap-2"
              disabled={isUploading}
            >
              <Upload className="h-4 w-4" />
              Select File to Encrypt
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-2 rounded-md bg-card/50">
              <File className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              {!isUploading && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancelUpload}
                  className="h-7 w-7"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {isUploading ? (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-center text-xs text-muted-foreground">
                  {progress < 25 && "Preparing file..."}
                  {progress >= 25 && progress < 75 && "Encrypting and uploading..."}
                  {progress >= 75 && progress < 100 && "Finalizing..."}
                  {progress === 100 && (
                    <span className="flex items-center justify-center gap-1 text-accent">
                      <Check className="h-3 w-3" /> Uploaded successfully
                    </span>
                  )}
                </p>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleUpload}
                  className="w-full gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Encrypt & Upload
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
