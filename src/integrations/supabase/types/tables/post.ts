import type { Database } from '../database';

type Tables = Database['public']['Tables'];
type DbPost = Tables['posts']['Row'];
type DbPoll = Tables['polls']['Row'];
type DbPollVote = Tables['poll_votes']['Row'];
type DbHashtag = Tables['hashtags']['Row'];
type DbPostHashtag = Tables['post_hashtags']['Row'];

export interface DatabasePost extends Omit<DbPost, 'scheduled_for'> {
  profiles: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  post_likes?: { id: string }[];
  bookmarks?: { id: string }[];
  comments?: { id: string }[];
  quoted_post?: DatabasePost | null;
  thread_parent?: DatabasePost | null;
  polls?: DatabasePoll[];
  hashtags?: DatabaseHashtag[];
  scheduled_for?: Date | null;
}

export interface DatabasePoll extends Omit<DbPoll, 'ends_at'> {
  votes?: DatabasePollVote[];
  ends_at: Date;
}

export interface DatabasePollVote extends DbPollVote {}

export interface DatabaseHashtag extends DbHashtag {}

export interface DatabasePostHashtag extends DbPostHashtag {}