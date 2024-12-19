import { Database } from '../database';

export interface List extends Database['public']['Tables']['lists']['Row'] {
  members?: ListMember[];
  creator?: {
    username: string;
    avatar_url: string | null;
  };
}

export interface ListMember extends Database['public']['Tables']['list_members']['Row'] {
  profile?: {
    username: string;
    avatar_url: string | null;
  };
}