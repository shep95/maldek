export interface Comment {
  id: string;
  content: string;
  created_at: string;
  parent_id?: string | null;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}