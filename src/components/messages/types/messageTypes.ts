
export interface User {
  id: string;
  username: string;
  avatar_url?: string | null;
}

export interface Message {
  id: string;
  content: string;
  created_at: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  is_read: boolean;
  is_encrypted?: boolean;
  decrypted_content?: string;
  sender?: User;
  recipient?: User;
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  participants: User[];
  last_message?: Message;
  unread_count: number;
}
