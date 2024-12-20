import { useNavigate } from "react-router-dom";
import { Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

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

    // Split content by code blocks first
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      // Handle code blocks
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3).trim();
        return (
          <div key={index} className="my-4">
            <SyntaxHighlighter
              language="typescript"
              style={oneDark}
              className="rounded-lg text-sm"
            >
              {code}
            </SyntaxHighlighter>
          </div>
        );
      }

      // Process regular text
      return part.split(' ').map((word, wordIndex) => {
        // Handle mentions
        if (word.startsWith('@')) {
          const username = word.slice(1);
          return (
            <span key={`${index}-${wordIndex}`} className="inline-block">
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
            <span key={`${index}-${wordIndex}`}>
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
            <span key={`${index}-${wordIndex}`}>
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
    });
  };

  return (
    <div>
      <p className={cn(
        "text-foreground whitespace-pre-wrap",
        "prose prose-orange max-w-none",
        "prose-a:text-orange-500 prose-a:no-underline hover:prose-a:underline",
        "prose-code:bg-muted prose-code:rounded prose-code:px-1"
      )}>
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