import { Database } from '../database';

type DbList = Database['public']['Tables']['lists']['Row'];
type DbListMember = Database['public']['Tables']['list_members']['Row'];

export interface List extends DbList {
  members?: ListMember[];
  creator?: {
    username: string;
    avatar_url: string | null;
  };
}

export interface ListMember extends DbListMember {
  profile?: {
    username: string;
    avatar_url: string | null;
  };
}