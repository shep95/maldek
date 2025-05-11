
export interface Conversation {
  id: string;
  name: string;
  user_id: string;
  participant_id: string | null;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
  is_group?: boolean;
  created_at?: string;
}

export interface Message {
  id: string;
  conversation_id?: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
  status: string;
}
