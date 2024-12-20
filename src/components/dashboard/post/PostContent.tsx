import { useState } from "react";
import { PostText } from "./content/PostText";
import { PostTranslation } from "./content/PostTranslation";
import { PostEditor } from "./content/PostEditor";

interface PostContentProps {
  content: string;
  userLanguage: string;
  isEditing: boolean;
  editedContent?: string;
  onEditContentChange?: (content: string) => void;
}

export const PostContent = ({
  content,
  userLanguage,
  isEditing,
  editedContent,
  onEditContentChange
}: PostContentProps) => {
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);

  if (isEditing) {
    return (
      <PostEditor
        content={editedContent || content}
        onEditContentChange={(content) => onEditContentChange?.(content)}
      />
    );
  }

  return (
    <div>
      <PostText
        content={content}
        translatedContent={translatedContent}
        onShowOriginal={() => setTranslatedContent(null)}
      />
      {!translatedContent && (
        <PostTranslation
          content={content}
          userLanguage={userLanguage}
          onTranslated={setTranslatedContent}
        />
      )}
    </div>
  );
};