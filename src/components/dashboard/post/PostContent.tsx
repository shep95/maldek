import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Languages, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const [hoveredUser, setHoveredUser] = useState<any>(null);

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

  const handleUsernameClick = async (e: React.MouseEvent, username: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Navigating to profile from mention:', username);
    navigate(`/@${username}`);
  };

  const fetchUserProfile = async (username: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error) throw error;
      setHoveredUser(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const renderContent = (text: string) => {
    // URL regex pattern
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    // Hashtag pattern
    const hashtagPattern = /#(\w+)/g;
    // Username pattern
    const mentionPattern = /@(\w+)/g;
    
    return text.split(' ').map((word, index) => {
      // Handle mentions with hover card
      if (word.startsWith('@')) {
        const username = word.slice(1);
        return (
          <span key={index} className="inline-block">
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button
                  variant="link"
                  className="p-0 h-auto text-orange-500 font-semibold hover:text-orange-600"
                  onClick={(e) => handleUsernameClick(e, username)}
                  onMouseEnter={() => fetchUserProfile(username)}
                >
                  {word}
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                {hoveredUser && (
                  <div className="flex justify-between space-x-4">
                    <Avatar>
                      <AvatarImage src={hoveredUser.avatar_url} />
                      <AvatarFallback>{hoveredUser.username[0]}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold">@{hoveredUser.username}</h4>
                      <p className="text-sm text-muted-foreground">
                        {hoveredUser.bio || 'No bio yet'}
                      </p>
                      <div className="flex items-center pt-2">
                        <span className="text-xs text-muted-foreground">
                          {hoveredUser.follower_count} followers
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </HoverCardContent>
            </HoverCard>
            {' '}
          </span>
        );
      }
      
      // Handle hashtags
      if (word.match(hashtagPattern)) {
        return (
          <span key={index}>
            <Button
              variant="link"
              className="p-0 h-auto text-orange-500 font-semibold hover:text-orange-600"
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Implement hashtag search
                toast.info('Hashtag search coming soon!');
              }}
            >
              {word}
            </Button>
            {' '}
          </span>
        );
      }
      
      // Handle URLs with preview
      if (urlPattern.test(word)) {
        return (
          <span key={index}>
            <a
              href={word}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 hover:text-orange-600 hover:underline inline-flex items-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {word}
              <LinkIcon className="h-3 w-3" />
            </a>
            {' '}
          </span>
        );
      }
      
      // Return regular word
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