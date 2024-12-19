import { Author } from "@/utils/postUtils";

export interface CreatePostDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: Author;
  onPostCreated: (newPost: any) => void;
}

export interface PostData {
  content: string;
  user_id: string;
  media_urls: string[];
  scheduled_for?: string;
}