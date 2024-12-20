import { useNavigate } from "react-router-dom";
import { Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PostTextProps {
  content: string;
  translatedContent?: string | null;
  onShowOriginal?: () => void;
}

export const PostText = ({ content, translatedContent, onShowOriginal }: PostTextProps) => {
  const navigate = useNavigate();

  const renderContent = (text: string) => {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const hashtagPattern = /#(\w+)/g;
    const mentionPattern = /@(\w+)/g;
    const codeBlockPattern = /```([\s\S]*?)```/g;

    return text.split(' ').map((word, index) => {
      // Handle code blocks
      if (word.match(codeBlockPattern)) {
        return (
          <pre key={index} className="bg-muted p-2 rounded-lg my-2 overflow-x-auto">
            <code>{word.replace(/```/g, '')}</code>
          </pre>
        );
      }

      // Handle mentions
      if (word.startsWith('@')) {
        const username = word.slice(1);
        return (
          <span key={index} className="inline-block">
            <Button
              variant="link"
              className="p-0 h-auto text-orange-500 font-semibold hover:text-orange-600"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/@${username}`);
              }}
            >
              {word}
            </Button>
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
                navigate(`/hashtag/${word.slice(1)}`);
              }}
            >
              {word}
            </Button>
            {' '}
          </span>
        );
      }
      
      // Handle URLs
      if (urlPattern.test(word)) {
        return (
          <span key={index}>
            <a
              href={word}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 hover:text-orange-600 hover:underline inline-flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              {word}
              <LinkIcon className="h-3 w-3" />
            </a>
            {' '}
          </span>
        );
      }
      
      return word + ' ';
    });
  };

  return (
    <div>
      <p className="text-foreground whitespace-pre-wrap">
        {renderContent(translatedContent || content)}
      </p>
      {translatedContent && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onShowOriginal?.();
          }}
          className="mt-2"
        >
          Show original
        </Button>
      )}
    </div>
  );
};