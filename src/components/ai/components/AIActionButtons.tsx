import { Button } from "@/components/ui/button";
import { 
  Wand2,
  Image,
  Languages,
  ShieldCheck,
  Mic
} from "lucide-react";

interface AIActionButtonsProps {
  isLoading: boolean;
  hasContent: boolean;
  onEnhance: () => void;
  onGenerateImage?: () => void;
  onTranslate: () => void;
  onModerate: () => void;
  onSpeechSynthesis?: () => void;
}

export const AIActionButtons = ({
  isLoading,
  hasContent,
  onEnhance,
  onGenerateImage,
  onTranslate,
  onModerate,
  onSpeechSynthesis
}: AIActionButtonsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onEnhance}
        disabled={isLoading || !hasContent}
      >
        <Wand2 className="h-4 w-4 mr-2" />
        Enhance
      </Button>

      {onGenerateImage && (
        <Button
          variant="outline"
          size="sm"
          onClick={onGenerateImage}
          disabled={isLoading || !hasContent}
        >
          <Image className="h-4 w-4 mr-2" />
          Generate Image
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={onTranslate}
        disabled={isLoading || !hasContent}
      >
        <Languages className="h-4 w-4 mr-2" />
        Translate
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onModerate}
        disabled={isLoading || !hasContent}
      >
        <ShieldCheck className="h-4 w-4 mr-2" />
        Check Content
      </Button>

      {onSpeechSynthesis && (
        <Button
          variant="outline"
          size="sm"
          onClick={onSpeechSynthesis}
          disabled={isLoading || !hasContent}
        >
          <Mic className="h-4 w-4 mr-2" />
          Generate Audio
        </Button>
      )}
    </div>
  );
};