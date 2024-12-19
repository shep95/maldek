import { Database } from '../database';

// Define the Tables type from the Database public schema
export type Tables = Database['public']['Tables'];

// Core content types
export type DbPost = Tables['posts']['Row'];
export type DbPoll = Tables['polls']['Row'];
export type DbPollVote = Tables['poll_votes']['Row'];

// Hashtag related types
export type DbHashtag = Tables['hashtags']['Row'];
export type DbPostHashtag = Tables['post_hashtags']['Row'];

// List related types
export type DbList = Tables['lists']['Row'];
export type DbListMember = Tables['list_members']['Row'];