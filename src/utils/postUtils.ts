export interface Author {
  id: string;
  username: string;
  avatar_url: string | null;
  name: string;
}

export interface Post {
  id: string;
  content: string;
  author: Author;
  timestamp: Date;
  media_urls?: string[] | null;
  likes: number;
  comments: number;
  reposts: number;
  isLiked: boolean;
  isBookmarked: boolean;
  quoted_post?: Post | null;
  thread_parent?: Post | null;
  thread_position?: number;
  scheduled_for?: Date | null;
  polls?: {
    id: string;
    question: string;
    options: string[];
    ends_at: Date;
    votes?: {
      option_index: number;
      user_id: string;
    }[];
  }[];
  hashtags?: {
    id: string;
    name: string;
  }[];
}

export const formatPostDate = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return `${seconds}s`;
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString();
};

export const formatDateForSupabase = (date: Date): string => {
  return date.toISOString();
};