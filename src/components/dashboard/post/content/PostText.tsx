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
  truncate?: boolean;
}

export const PostText = ({ content, translatedContent, onShowOriginal, truncate = true }: PostTextProps) => {
  const navigate = useNavigate();

  const truncateUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      const path = urlObj.pathname;
      const truncatedPath = path.length > 15 ? path.substring(0, 15) + '...' : path;
      return `${domain}${truncatedPath}`;
    } catch (e) {
      return url.length > 30 ? url.substring(0, 30) + '...' : url;
    }
  };

  const truncateContent = (text: string) => {
    if (!truncate) return text;
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  };

  const renderContent = (text: string) => {
    // First truncate the content if needed
    const processedText = truncateContent(text);

    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const hashtagPattern = /#(\w+)/g;
    const mentionPattern = /@(\w+)/g;
    const codeBlockPattern = /```([\s\S]*?)```/g;

    // Split content by code blocks first
    const parts = processedText.split(/(```[\s\S]*?```)/g);

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
            <span key={`${index}-${wordIndex}`} className="inline-flex items-center gap-1 max-w-full">
              <a
                href={word}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-500 hover:text-orange-600 hover:underline truncate"
                onClick={(e) => e.stopPropagation()}
                title={word}
              >
                {truncateUrl(word)}
                <LinkIcon className="h-3 w-3 inline-block ml-1 flex-shrink-0" />
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
        "text-foreground whitespace-pre-wrap break-words",
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