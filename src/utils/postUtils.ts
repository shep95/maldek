import { Author } from "@/utils/postUtils";

export interface Post {
  id: string;
  content: string;
  authorId: string;
  author: Author;
  timestamp: Date;
  mediaUrls: string[];
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
    authorId: author.id,
    author,
    timestamp: new Date(),
    mediaUrls,
    likes: 0,
    comments: 0,
    reposts: 0,
    isLiked: false,
    isBookmarked: false
  };
};
