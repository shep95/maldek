
import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, Image } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { MessageItem } from "./MessageItem";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { MessageFileUpload } from "./MessageFileUpload";
import { useEncryption } from "@/providers/EncryptionProvider";
import { secureFetch } from "@/utils/secureLogging";
import { toast } from "sonner";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  file_url?: string;
  file_type?: string;
  file_name?: string;
  encrypted_metadata?: string;
}

interface MessagePanelProps {
  conversationId: string | null;
  messages: Message[];
  onSendMessage: (content: string, fileData?: any) => Promise<boolean>;
  isLoading: boolean;
}

export const MessagePanel = ({
  conversationId,
  messages,
  onSendMessage,
  isLoading,
}: MessagePanelProps) => {
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const session = useSession();
  const encryption = useEncryption();
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() && !fileToUpload) return;
    
    try {
      const success = await onSendMessage(message, fileToUpload ? {
        file: fileToUpload,
        previewUrl: filePreview
      } : undefined);
      
      if (success) {
        setMessage("");
        setFileToUpload(null);
        setFilePreview(null);
        setShowFileUpload(false);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileChange = (file: File | null) => {
    setFileToUpload(file);
    
    if (file) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    } else {
      setFilePreview(null);
    }
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
          <p className="text-muted-foreground">
            Choose an existing conversation or start a new one
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Conversation header */}
      <div className="p-4 border-b border-white/10">
        <h2 className="font-semibold">Conversation Name</h2>
      </div>

      {/* Message list */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex flex-col space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                  <div className="bg-white/5 h-16 rounded-lg w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No messages yet</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageItem
                key={msg.id}
                message={msg}
                isMine={msg.sender_id === session?.user?.id}
              />
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* File upload area */}
      {showFileUpload && (
        <MessageFileUpload
          onFileChange={handleFileChange}
          previewUrl={filePreview}
          file={fileToUpload}
          onCancel={() => {
            setShowFileUpload(false);
            setFileToUpload(null);
            setFilePreview(null);
          }}
          isUploading={isUploading}
        />
      )}

      {/* Input area */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-end gap-2">
          <div className="relative flex-1">
            <Textarea
              ref={textareaRef}
              placeholder="Type a message..."
              className="min-h-[60px] max-h-[120px] resize-none bg-[#0d0d0d] border-white/10"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || isUploading}
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="text-muted-foreground border-white/10"
              onClick={() => setShowFileUpload(!showFileUpload)}
              disabled={isLoading || isUploading}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              disabled={(!message.trim() && !fileToUpload) || isLoading || isUploading}
              onClick={handleSendMessage}
              className="bg-accent hover:bg-accent/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
