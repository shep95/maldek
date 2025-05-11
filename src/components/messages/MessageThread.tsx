import React, { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message as MessageType, User } from "./types/messageTypes";
import { format } from "date-fns";
import { ArrowLeft, Lock, Send, Trash2, Image } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { isVideoFile } from "@/utils/mediaUtils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { MediaViewer } from "./MediaViewer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MessageThreadProps {
  messages: MessageType[];
  currentUserId?: string;
  currentUser?: { id: string; username: string };
  recipient?: User;
  users?: Record<string, User>;
  onSendMessage?: (content: string, mediaFile?: File) => void;
  onBackClick?: () => void;
  onDeleteConversation?: () => void;
}

export const MessageThread: React.FC<MessageThreadProps> = ({
  messages,
  currentUserId,
  currentUser,
  recipient,
  users = {},
  onSendMessage,
  onBackClick,
  onDeleteConversation
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const actualCurrentUserId = currentUser?.id || currentUserId;
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // State for the media viewer
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerMediaUrl, setViewerMediaUrl] = useState<string>("");
  const [isViewerMediaVideo, setIsViewerMediaVideo] = useState(false);

  useEffect(() => {
    // Scroll to the bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Create object URL for media preview
  useEffect(() => {
    if (mediaFile) {
      const objectUrl = URL.createObjectURL(mediaFile);
      setMediaPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setMediaPreview(null);
    }
  }, [mediaFile]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if ((newMessage.trim() || mediaFile) && onSendMessage) {
      onSendMessage(newMessage, mediaFile || undefined);
      setNewMessage("");
      setMediaFile(null);
      setMediaPreview(null);
      
      // Reset file input to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Validate file size (100KB max)
      if (file.size > 100 * 1024) {
        alert("File size should be less than 100KB");
        return;
      }
      setMediaFile(file);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };
  
  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (onDeleteConversation) {
      onDeleteConversation();
    }
    setIsDeleteDialogOpen(false);
  };

  const openMediaViewer = (mediaUrl: string, isVideo: boolean) => {
    setViewerMediaUrl(mediaUrl);
    setIsViewerMediaVideo(isVideo);
    setViewerOpen(true);
  };

  if (messages.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b py-3 px-4 flex items-center justify-between">
          <div className="flex items-center">
            {onBackClick && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackClick}
                className="mr-2 -ml-2 touch-target"
                aria-label="Back to conversations"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <h2 className="font-semibold">
              {recipient ? `Chat with ${recipient.username}` : "Messages"}
            </h2>
          </div>
          
          {onDeleteConversation && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onDeleteConversation}
              className="text-muted-foreground hover:text-destructive touch-target"
              aria-label="Delete conversation"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
        </div>
        <div className="flex-grow flex flex-col items-center justify-center h-full text-muted-foreground p-4">
          <p>No messages yet</p>
          <p className="text-sm">Start the conversation by sending a message below</p>
        </div>
        
        {onSendMessage && (
          <form onSubmit={handleSendMessage} className="mt-auto p-3 sm:p-4 border-t pb-safe">
            <div className="flex flex-col gap-2 max-w-5xl mx-auto">
              {mediaPreview && (
                <div className="relative rounded-lg overflow-hidden bg-muted/50 border">
                  <div className="max-w-[200px] mx-auto my-2">
                    <AspectRatio ratio={16/9} className="rounded-lg overflow-hidden">
                      {isVideoFile(mediaFile?.name || '') ? (
                        <video 
                          src={mediaPreview} 
                          className="w-full h-full object-cover rounded-lg" 
                          controls
                        />
                      ) : (
                        <img 
                          src={mediaPreview} 
                          alt="Media preview" 
                          className="w-full h-full object-cover rounded-lg"
                        />
                      )}
                    </AspectRatio>
                  </div>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="ghost"
                    onClick={() => {
                      setMediaFile(null);
                      setMediaPreview(null);
                    }}
                    className="absolute top-2 right-2 h-8 w-8 p-0"
                  >
                    <span className="sr-only">Remove</span>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  onClick={openFileDialog}
                  className="h-[44px] w-[44px]"
                >
                  <Image className="h-5 w-5" />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 min-h-[44px]"
                />
                <Button 
                  type="submit" 
                  disabled={!newMessage.trim() && !mediaFile} 
                  size="icon" 
                  className="h-[44px] w-[44px]"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b py-3 px-4 flex items-center justify-between">
        <div className="flex items-center">
          {onBackClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackClick}
              className="mr-2 -ml-2 touch-target"
              aria-label="Back to conversations"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            {recipient && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={recipient.avatar_url || undefined} />
                <AvatarFallback>{recipient.username?.[0]?.toUpperCase() || "?"}</AvatarFallback>
              </Avatar>
            )}
            <h2 className="font-semibold">
              {recipient ? recipient.username : "Messages"}
            </h2>
          </div>
        </div>
        
        {onDeleteConversation && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleDeleteClick}
            className="text-muted-foreground hover:text-destructive touch-target"
            aria-label="Delete conversation"
            title="Delete conversation"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="flex-grow overflow-y-auto p-3 sm:p-4 md:p-6 hide-scrollbar">
        <div className="flex flex-col gap-3 sm:gap-4 max-w-5xl mx-auto">
          {messages.map((message) => {
            const isSentByMe = message.sender_id === actualCurrentUserId;
            const sender = isSentByMe 
              ? (currentUser?.username || "You") 
              : (recipient?.username || users[message.sender_id]?.username || "Unknown");
            const senderAvatar = !isSentByMe 
              ? (recipient?.avatar_url || users[message.sender_id]?.avatar_url) 
              : undefined;

            return (
              <div
                key={message.id}
                className={`flex ${isSentByMe ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-2 max-w-[85%] sm:max-w-[90%] ${isSentByMe ? "flex-row-reverse" : ""}`}>
                  {!isSentByMe && (
                    <Avatar className="h-8 w-8 hidden sm:flex mt-1">
                      <AvatarImage src={senderAvatar || undefined} />
                      <AvatarFallback>{sender[0]?.toUpperCase() || "?"}</AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <div
                      className={`rounded-2xl px-3 py-2 ${
                        isSentByMe
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-muted rounded-tl-none"
                      }`}
                    >
                      {message.is_encrypted ? (
                        <div className="flex items-center gap-1 text-xs">
                          <Lock size={12} />
                          <span>Encrypted message</span>
                        </div>
                      ) : null}
                      
                      {message.media_url && (
                        <div 
                          className="mb-2 overflow-hidden rounded-xl cursor-pointer"
                          onClick={() => openMediaViewer(message.media_url!, isVideoFile(message.media_url!))}
                        >
                          {isVideoFile(message.media_url) ? (
                            <div className="relative w-full max-w-[240px]">
                              <AspectRatio ratio={16/9} className="rounded-xl overflow-hidden">
                                <video 
                                  src={message.media_url} 
                                  className="w-full h-full object-cover"
                                  // Don't include controls here since clicking opens the viewer
                                />
                              </AspectRatio>
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <div className="p-2 rounded-full bg-black/60">
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 5V19L19 12L8 5Z" fill="white"/>
                                  </svg>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="relative w-full max-w-[240px]">
                              <AspectRatio ratio={4/3} className="rounded-xl overflow-hidden">
                                <img 
                                  src={message.media_url} 
                                  alt="Media" 
                                  className="w-full h-full object-cover"
                                />
                              </AspectRatio>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {message.content && (
                        <p className="whitespace-pre-wrap break-words text-sm">
                          {message.decrypted_content || message.content}
                        </p>
                      )}
                    </div>
                    <div
                      className={`text-xs text-muted-foreground mt-1 flex items-center ${
                        isSentByMe ? "justify-end" : ""
                      }`}
                    >
                      {format(new Date(message.created_at), "MMM d, h:mm a")}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {onSendMessage && (
        <form onSubmit={handleSendMessage} className="mt-auto p-3 sm:p-4 border-t pb-safe">
          <div className="flex flex-col gap-2 max-w-5xl mx-auto">
            {mediaPreview && (
              <div className="relative rounded-lg overflow-hidden bg-muted/50 border">
                <div className="max-w-[200px] mx-auto my-2">
                  <AspectRatio ratio={16/9} className="rounded-lg overflow-hidden">
                    {isVideoFile(mediaFile?.name || '') ? (
                      <video 
                        src={mediaPreview} 
                        className="w-full h-full object-cover rounded-lg" 
                        controls
                      />
                    ) : (
                      <img 
                        src={mediaPreview} 
                        alt="Media preview" 
                        className="w-full h-full object-cover rounded-lg"
                      />
                    )}
                  </AspectRatio>
                </div>
                <Button 
                  type="button" 
                  size="sm" 
                  variant="ghost"
                  onClick={() => {
                    setMediaFile(null);
                    setMediaPreview(null);
                  }}
                  className="absolute top-2 right-2 h-8 w-8 p-0"
                >
                  <span className="sr-only">Remove</span>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="icon" 
                onClick={openFileDialog}
                className="h-[44px] w-[44px]"
              >
                <Image className="h-5 w-5" />
              </Button>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 min-h-[44px]"
              />
              <Button 
                type="submit" 
                disabled={!newMessage.trim() && !mediaFile} 
                className="h-[44px] min-w-[44px] px-3 flex-shrink-0"
              >
                <Send className="h-5 w-5 sm:mr-2" />
                <span className="hidden sm:inline">Send</span>
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </form>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this conversation and all its messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Media Viewer */}
      <MediaViewer 
        open={viewerOpen}
        mediaUrl={viewerMediaUrl}
        isVideo={isViewerMediaVideo}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
};
