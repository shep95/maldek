import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PostTranslationProps {
  content: string;
  userLanguage: string;
  onTranslated: (translatedText: string) => void;
}

export const PostTranslation = ({ content, userLanguage, onTranslated }: PostTranslationProps) => {
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    if (isTranslating || !userLanguage) return;
    
    try {
      setIsTranslating(true);
      const { data, error } = await supabase.functions.invoke('translate-text', {
        body: { text: content, targetLanguage: userLanguage }
      });

      if (error) throw error;
      onTranslated(data.translatedText);
    } catch (error) {
      console.error('Translation error:', error);
      toast.error("Failed to translate post");
    } finally {
      setIsTranslating(false);
    }
  };

  return (
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
  );
};