import { DbList, DbListMember } from './database-tables';

export interface List extends DbList {
  members?: ListMember[];
}

export interface ListMember extends DbListMember {
  profile?: {
    username: string;
    avatar_url: string | null;
  };
}