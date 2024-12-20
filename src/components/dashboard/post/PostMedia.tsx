import { MediaGallery } from "./media/MediaGallery";
import { supabase } from "@/integrations/supabase/client";

interface PostMediaProps {
  mediaUrls: string[];
  onMediaClick?: (url: string) => void;
}

export const PostMedia = ({ mediaUrls, onMediaClick }: PostMediaProps) => {
  if (!mediaUrls || mediaUrls.length === 0) {
    return null;
  }

  const getPublicUrl = (url: string) => {
    if (url.startsWith('http')) {
      return url;
    }
    const { data } = supabase.storage
      .from('posts')
      .getPublicUrl(url);
    return data.publicUrl;
  };

  const publicUrls = mediaUrls.map(getPublicUrl);

  return <MediaGallery mediaUrls={publicUrls} onMediaClick={onMediaClick} />;
};