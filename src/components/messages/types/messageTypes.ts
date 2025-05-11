
export interface User {
  id: string;
  username: string;
  avatar_url?: string;
  // Add other user fields as needed
}

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  recipient_id?: string;
  created_at: string;
  is_read: boolean;
  is_encrypted?: boolean;
  decrypted_content?: string;
  conversation_id?: string;
  media_url?: string; // Added for media support
}

export interface Conversation {
  id: string;
  participants: User[];
  created_at: string;
  updated_at: string;
  unread_count: number;
  last_message?: Message;
}
