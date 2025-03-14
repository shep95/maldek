
import { useState } from "react";
import { PostText } from "./content/PostText";
import { PostTranslation } from "./content/PostTranslation";
import { PostEditor } from "./content/PostEditor";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface PostContentProps {
  content: string;
  userLanguage: string;
  isEditing: boolean;
  editedContent?: string;
  onEditContentChange?: (content: string) => void;
  truncate?: boolean;
  isEdited?: boolean;
  originalContent?: string | null;
}

export const PostContent = ({
  content,
  userLanguage,
  isEditing,
  editedContent,
  onEditContentChange,
  truncate = true,
  isEdited = false,
  originalContent = null
}: PostContentProps) => {
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [showingOriginal, setShowingOriginal] = useState(false);

  if (isEditing) {
    return (
      <PostEditor
        content={editedContent || content}
        onEditContentChange={(content) => onEditContentChange?.(content)}
      />
    );
  }

  const displayContent = showingOriginal && originalContent ? originalContent : content;

  return (
    <div className="space-y-2">
      <PostText
        content={displayContent}
        translatedContent={translatedContent}
        onShowOriginal={() => setTranslatedContent(null)}
        truncate={truncate}
        isEdited={isEdited}
        originalContent={originalContent}
      />
      {!translatedContent && (
        <PostTranslation
          content={displayContent}
          userLanguage={userLanguage}
          onTranslated={setTranslatedContent}
        />
      )}
    </div>
  );
};
