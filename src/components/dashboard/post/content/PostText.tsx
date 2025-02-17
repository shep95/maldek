
import { useNavigate } from "react-router-dom";
import { Link as LinkIcon, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useState } from "react";

interface PostTextProps {
  content: string;
  translatedContent?: string | null;
  onShowOriginal?: () => void;
  truncate?: boolean;
  isEdited?: boolean;
  originalContent?: string | null;
}

export const PostText = ({ 
  content, 
  translatedContent, 
  onShowOriginal, 
  truncate = true,
  isEdited = false,
  originalContent = null
}: PostTextProps) => {
  const navigate = useNavigate();
  const [showingOriginal, setShowingOriginal] = useState(false);

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

    // Enhanced URL pattern to match more domain extensions
    const urlPattern = /(https?:\/\/[^\s]+|(?:www\.)?[^\s]+\.(?:com|app|co|io|org|net|dev|xyz|ai|tech|cloud|me)[^\s]*)(?=[.,;:!?]*(?:\s|$))/g;
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
        
        // Enhanced URL handling
        const urlMatch = word.match(urlPattern);
        if (urlMatch) {
          const url = urlMatch[0];
          // Ensure URL has http/https protocol
          const fullUrl = url.startsWith('http') ? url : `https://${url}`;
          return (
            <span key={`${index}-${wordIndex}`} className="inline-flex items-center gap-1 max-w-full">
              <a
                href={fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-500 hover:text-orange-600 hover:underline truncate"
                onClick={(e) => e.stopPropagation()}
                title={url}
              >
                {truncateUrl(url)}
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

  const displayContent = showingOriginal && originalContent ? originalContent : content;

  return (
    <div>
      <p className={cn(
        "text-foreground whitespace-pre-wrap break-words",
        "prose prose-orange max-w-none",
        "prose-a:text-orange-500 prose-a:no-underline hover:prose-a:underline",
        "prose-code:bg-muted prose-code:rounded prose-code:px-1"
      )}>
        {renderContent(displayContent)}
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
      {isEdited && originalContent && (
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">Edited</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              setShowingOriginal(!showingOriginal);
            }}
          >
            <Eye className="h-3 w-3 mr-1" />
            {showingOriginal ? "Show edited" : "Show original"}
          </Button>
        </div>
      )}
    </div>
  );
};
