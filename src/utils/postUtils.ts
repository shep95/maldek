import { DatabasePost } from '@/integrations/supabase/types/tables/post';

export interface Author {
  id: string;
  username: string;
  avatar_url: string | null;
  name: string;
}

export interface Post extends DatabasePost {
  author: Author;
  timestamp: Date;
  likes: number;
  comments: number;
  reposts: number;
  isLiked: boolean;
  isBookmarked: boolean;
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