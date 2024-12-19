export interface Author {
  id: string;
  username: string;
  avatar_url: string | null;
  name?: string;
}

export interface Post {
  id: string;
  content: string;
  user_id: string;
  author: Author;
  timestamp: Date;
  media_urls: string[];
  likes: number;
  comments: number;
  reposts: number;
  isLiked: boolean;
  isBookmarked: boolean;
}

export const createNewPost = async (content: string, mediaFiles: File[], author: Author): Promise<Post> => {
  const mediaUrls = await Promise.all(
    mediaFiles.map(async (file) => {
      if (file.type.startsWith('video/')) {
        return URL.createObjectURL(file);
      }
      return URL.createObjectURL(file);
    })
  );

  return {
    id: crypto.randomUUID(),
    content,
    user_id: author.id,
    author,
    timestamp: new Date(),
    media_urls: mediaUrls,
    likes: 0,
    comments: 0,
    reposts: 0,
    isLiked: false,
    isBookmarked: false
  };
};