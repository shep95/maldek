import { Database } from '../database';

export interface Post extends Database['public']['Tables']['posts']['Row'] {
  profiles: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  post_likes?: { id: string }[];
  bookmarks?: { id: string }[];
  comments?: { id: string }[];
  quoted_post?: Post | null;
  thread_parent?: Post | null;
  polls?: Poll[];
  hashtags?: Hashtag[];
}

export interface Poll extends Database['public']['Tables']['polls']['Row'] {
  votes?: PollVote[];
}

export interface PollVote extends Database['public']['Tables']['poll_votes']['Row'] {}

export interface Hashtag extends Database['public']['Tables']['hashtags']['Row'] {}

export interface PostHashtag extends Database['public']['Tables']['post_hashtags']['Row'] {}