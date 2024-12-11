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
}