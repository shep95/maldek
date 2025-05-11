
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useEncryption } from "@/providers/EncryptionProvider";
import { Button } from "@/components/ui/button";
import { Download, FileText, Image as ImageIcon, Video, Mic } from "lucide-react";

interface MessageItemProps {
  message: {
    id: string;
    content: string;
    created_at: string;
    is_read: boolean;
    file_url?: string;
    file_type?: string;
    file_name?: string;
    encrypted_metadata?: string;
  };
  isMine: boolean;
}

export const MessageItem = ({ message, isMine }: MessageItemProps) => {
  const [decryptedContent, setDecryptedContent] = useState(message.content);
  const [decryptedFileUrl, setDecryptedFileUrl] = useState<string | null>(null);
  const [fileMetadata, setFileMetadata] = useState<any>(null);
  const encryption = useEncryption();

  useEffect(() => {
    const decryptMessage = async () => {
      try {
        if (!encryption.isEncryptionInitialized) return;
        
        // If content is encrypted (starts with E2EE:)
        if (message.content && message.content.startsWith("E2EE:")) {
          const encryptedText = message.content.substring(5);
          const decrypted = await encryption.decryptText(encryptedText);
          if (decrypted) {
            setDecryptedContent(decrypted);
          } else {
            setDecryptedContent("[Encrypted message]");
          }
        }
        
        // Decrypt file metadata if available
        if (message.encrypted_metadata) {
          const decryptedMetadata = await encryption.decryptText(message.encrypted_metadata);
          if (decryptedMetadata) {
            const metadata = JSON.parse(decryptedMetadata);
            setFileMetadata(metadata);
            
            // If we have an encrypted file URL, start decrypting it
            if (message.file_url && metadata.encryptionKey) {
              // We'll implement file decryption when needed - for now just set the URL
              setDecryptedFileUrl(message.file_url);
            }
          }
        }
      } catch (error) {
        console.error("Failed to decrypt message:", error);
      }
    };
    
    decryptMessage();
  }, [message, encryption]);
  
  const formattedTime = format(new Date(message.created_at), "h:mm a");
  
  // Determine file type icon
  const getFileIcon = () => {
    const fileType = message.file_type || fileMetadata?.fileType;
    if (!fileType) return <FileText className="h-4 w-4" />;
    
    if (fileType.startsWith("image/")) {
      return <ImageIcon className="h-4 w-4" />;
    } else if (fileType.startsWith("video/")) {
      return <Video className="h-4 w-4" />;
    } else if (fileType.startsWith("audio/")) {
      return <Mic className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className={cn(
      "flex mb-4",
      isMine ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[70%] rounded-lg px-4 py-2",
        isMine ? "bg-accent/90 text-white" : "bg-[#0d0d0d] text-white"
      )}>
        <div className="mb-1">
          {decryptedContent}
        </div>
        
        {/* File attachment */}
        {message.file_url && (
          <div className="mt-2 space-y-2">
            {message.file_type?.startsWith("image/") && decryptedFileUrl && (
              <div className="relative rounded-md overflow-hidden">
                <img 
                  src={decryptedFileUrl} 
                  alt="Attached image" 
                  className="max-h-60 w-auto object-contain"
                />
              </div>
            )}
            
            {message.file_type?.startsWith("video/") && decryptedFileUrl && (
              <div className="relative rounded-md overflow-hidden">
                <video 
                  controls 
                  className="max-h-60 w-auto"
                >
                  <source src={decryptedFileUrl} type={message.file_type} />
                  Your browser does not support video playback.
                </video>
              </div>
            )}
            
            {message.file_type?.startsWith("audio/") && decryptedFileUrl && (
              <audio controls className="w-full">
                <source src={decryptedFileUrl} type={message.file_type} />
                Your browser does not support audio playback.
              </audio>
            )}
            
            {(!message.file_type?.startsWith("image/") && 
             !message.file_type?.startsWith("video/") && 
             !message.file_type?.startsWith("audio/") && 
             decryptedFileUrl) && (
              <div className="bg-black/30 rounded-md p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getFileIcon()}
                  <span className="text-sm truncate max-w-[200px]">
                    {message.file_name || fileMetadata?.fileName || "File"}
                  </span>
                </div>
                <Button 
                  size="sm"
                  variant="ghost"
                  className="text-white hover:text-white hover:bg-white/10"
                  asChild
                >
                  <a href={decryptedFileUrl} download target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            )}
          </div>
        )}
        
        <div className="text-xs opacity-70 text-right mt-1">
          {formattedTime}
          {isMine && (
            <span className="ml-1">
              {message.is_read ? "✓✓" : "✓"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
