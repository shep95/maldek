import { createPersistentMediaUrl } from './mediaUtils';

export interface Author {
  id: string;
  name: string;
  username: string;
  profilePicture?: string;
}

export interface Post {
  id: string;
  content: string;
  timestamp: Date;
  mentions?: string[];
  mediaUrls?: string[];
  likes: number;
  comments: number;
  reposts: number;
  isLiked: boolean;
  isBookmarked: boolean;
  authorId: string;
  author: Author;
}

export const createNewPost = async (
  content: string,
  mediaFiles: File[],
  author: Author
): Promise<Post> => {
  const mentions = content.match(/@(\w+)/g)?.map(m => m.slice(1)) || [];
  
  // Create persistent URLs for all media files
  const mediaUrls = await Promise.all(
    mediaFiles.map(file => createPersistentMediaUrl(file))
  );

  return {
    id: Date.now().toString(),
    content,
    timestamp: new Date(),
    mentions,
    mediaUrls,
    likes: 0,
    comments: 0,
    reposts: 0,
    isLiked: false,
    isBookmarked: false,
    authorId: author.id,
    author,
  };
};