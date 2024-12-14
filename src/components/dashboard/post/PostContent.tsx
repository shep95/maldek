import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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
  const navigate = useNavigate();
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);

  const handleTranslate = async () => {
    if (isTranslating || !userLanguage) return;
    
    try {
      setIsTranslating(true);
      const { data, error } = await supabase.functions.invoke('translate-text', {
        body: { text: content, targetLanguage: userLanguage }
      });

      if (error) throw error;
      setTranslatedContent(data.translatedText);
    } catch (error) {
      console.error('Translation error:', error);
      toast.error("Failed to translate post");
    } finally {
      setIsTranslating(false);
    }
  };

  const renderContent = (text: string) => {
    return text.split(' ').map((word, index) => {
      if (word.startsWith('@')) {
        const username = word.slice(1);
        return (
          <span key={index}>
            <Button
              variant="link"
              className="p-0 h-auto text-orange-500 font-semibold hover:text-orange-600"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/${username}`);
              }}
            >
              {word}
            </Button>
            {' '}
          </span>
        );
      }
      return word + ' ';
    });
  };

  if (isEditing) {
    return (
      <textarea
        value={editedContent}
        onChange={(e) => onEditContentChange?.(e.target.value)}
        className="w-full min-h-[100px] p-2 border rounded"
      />
    );
  }

  return (
    <div>
      <p className="text-foreground whitespace-pre-wrap">
        {renderContent(translatedContent || content)}
      </p>
      {!translatedContent && userLanguage && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleTranslate();
          }}
          disabled={isTranslating}
          className="mt-2"
        >
          <Languages className="h-4 w-4 mr-2" />
          {isTranslating ? "Translating..." : "Translate"}
        </Button>
      )}
      {translatedContent && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setTranslatedContent(null);
          }}
          className="mt-2"
        >
          Show original
        </Button>
      )}
    </div>
  );
};