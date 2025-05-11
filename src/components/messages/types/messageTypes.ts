
export interface User {
  id: string;
  username: string;
  avatar_url?: string | null;
}

export interface Message {
  id: string;
  content: string;
  created_at: string;
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
  last_message?: Message;
  participants: User[];
  updated_at: string;
  unread_count: number;
}
