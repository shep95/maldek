export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  referencedMessageId?: string;  // To track which message this is responding to
}