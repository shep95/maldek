export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  referencedMessageId?: string;
  imageUrl?: string;  // New field for image attachments
}