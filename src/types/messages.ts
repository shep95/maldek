
export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  follower_count: number;
}

export interface Message {
  id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  status: string;
  sender: Profile;
  sender_id: string;
  recipient_id: string;
  recipient?: Profile;
  reply_to_id?: string | null;
  media_urls?: string[];
  reactions: { [key: string]: string[] };
  translated_content: { [key: string]: string };
  is_edited: boolean;
  telegram_message_id?: number;
  telegram_chat_id?: number;
}

export interface TelegramUser {
  id: string;
  user_id: string;
  telegram_id: number;
  telegram_username: string | null;
  access_hash: number | null;
  created_at: string;
  updated_at: string;
}
