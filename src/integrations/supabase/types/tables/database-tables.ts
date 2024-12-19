import { Database } from '../database';

export type Tables = Database['public']['Tables'];
export type DbPost = Tables['posts']['Row'];
export type DbPoll = Tables['polls']['Row'];
export type DbPollVote = Tables['poll_votes']['Row'];
export type DbHashtag = Tables['hashtags']['Row'];
export type DbPostHashtag = Tables['post_hashtags']['Row'];
export type DbList = Tables['lists']['Row'];
export type DbListMember = Tables['list_members']['Row'];