
export interface User {
  id: string;
  username: string;
  avatar_url?: string;
  email?: string;
  display_name?: string;
}

export interface Message {
  id: string;
  content: string;
  decrypted_content?: string;
  sender_id: string;
  recipient_id: string;
  created_at: string;
  is_read: boolean;
  conversation_id: string;
  is_encrypted: boolean; // Always true in our implementation
}

export interface Conversation {
  id: string;
  participants: User[];
  last_message?: Message;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface MessageNotification {
  id: string;
  sender: User;
  message: string;
  timestamp: string;
  isRead: boolean;
}
