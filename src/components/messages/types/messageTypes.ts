
export interface Conversation {
  id: string;
  name: string;
  user_id: string;
  participant_id: string | null;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
  encrypted_metadata: string | null;
  is_group: boolean;
  created_at: string;
  metadata?: {
    isGroup: boolean;
    createdAt: string;
    [key: string]: any;
  };
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  file_url: string | null;
  file_type: string | null;
  file_name: string | null;
  encrypted_metadata: string | null;
  created_at: string;
}
