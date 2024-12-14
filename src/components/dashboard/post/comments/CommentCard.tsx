import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Languages } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CommentCardProps {
  comment: {
    id: string;
    content: string;
    created_at: string;
    user: {
      username: string;
      avatar_url: string | null;
    };
  };
  userLanguage: string;
}

export const CommentCard = ({ comment, userLanguage }: CommentCardProps) => {
  const navigate = useNavigate();
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);

  const handleTranslate = async () => {
    if (isTranslating || !userLanguage) return;
    
    try {
      setIsTranslating(true);
      const { data, error } = await supabase.functions.invoke('translate-text', {
        body: { text: comment.content, targetLanguage: userLanguage }
      });

      if (error) throw error;
      setTranslatedContent(data.translatedText);
    } catch (error) {
      console.error('Translation error:', error);
      toast.error("Failed to translate comment");
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <Card className="p-4 transition-all duration-200 hover:bg-accent/5">
      <div className="flex items-start gap-3">
        <Avatar 
          className="h-8 w-8 cursor-pointer" 
          onClick={() => navigate(`/${comment.user.username}`)}
        >
          <AvatarImage src={comment.user.avatar_url || undefined} />
          <AvatarFallback>{comment.user.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <h4 
              className="font-semibold cursor-pointer hover:underline" 
              onClick={() => navigate(`/${comment.user.username}`)}
            >
              @{comment.user.username}
            </h4>
            <span className="text-sm text-muted-foreground">
              {new Date(comment.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="mt-1 text-foreground">{translatedContent || comment.content}</p>
          {!translatedContent && userLanguage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleTranslate}
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
              onClick={() => setTranslatedContent(null)}
              className="mt-2"
            >
              Show original
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};