export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  referencedMessageId?: string;
  imageUrl?: string;  // For uploaded images
  generatedImageUrl?: string;  // For AI-generated images
}