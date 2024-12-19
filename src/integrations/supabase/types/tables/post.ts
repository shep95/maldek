import { Database } from '../database';

type DbPost = Database['public']['Tables']['posts']['Row'];
type DbPoll = Database['public']['Tables']['polls']['Row'];
type DbPollVote = Database['public']['Tables']['poll_votes']['Row'];
type DbHashtag = Database['public']['Tables']['hashtags']['Row'];
type DbPostHashtag = Database['public']['Tables']['post_hashtags']['Row'];

export interface Post extends Omit<DbPost, 'scheduled_for'> {
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
  scheduled_for?: Date | null;
}

export interface Poll extends Omit<DbPoll, 'ends_at'> {
  votes?: PollVote[];
  ends_at: Date;
}

export interface PollVote extends DbPollVote {}

export interface Hashtag extends DbHashtag {}

export interface PostHashtag extends DbPostHashtag {}