import type { Database } from '../database';

type Tables = Database['public']['Tables'];
type DbList = Tables['lists']['Row'];
type DbListMember = Tables['list_members']['Row'];

export interface List extends DbList {
  members?: ListMember[];
}

export interface ListMember extends DbListMember {
  profile?: {
    username: string;
    avatar_url: string | null;
  };
}