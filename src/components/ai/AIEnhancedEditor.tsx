import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Wand2,
  Image,
  Languages,
  ShieldCheck,
  Mic
} from "lucide-react";
import { useAIServices } from '@/hooks/useAIServices';
import { toast } from 'sonner';
import { PremiumFeatureNotice } from './components/PremiumFeatureNotice';

interface AIEnhancedEditorProps {
  value: string;
  onChange: (value: string) => void;
  onImageGenerate?: (imageUrl: string) => void;
  onAudioGenerate?: (audioUrl: string) => void;
}

export const AIEnhancedEditor = ({
  value,
  onChange,
  onImageGenerate,
  onAudioGenerate
}: AIEnhancedEditorProps) => {
  const session = useSession();
  const [targetLanguage, setTargetLanguage] = useState('es');
  const { 
    isLoading,
    enhanceText,
    generateImage,
    translateContent,
    moderateContent,
    synthesizeSpeech
  } = useAIServices();

  const { data: subscription } = useQuery({
    queryKey: ['user-subscription', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*, tier:subscription_tiers(*)')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .single();

      if (error) {
        console.error('Error fetching subscription:', error);
        return null;
      }

      return data;
    },
    enabled: !!session?.user?.id
  });

  const handleEnhance = useCallback(async () => {
    if (!subscription) {
      toast.error("This feature is only available for premium users");
      return;
    }

    try {
      const { enhanced } = await enhanceText(value);
      onChange(enhanced);
      toast.success('Text enhanced!');
    } catch (error) {
      console.error('Enhancement error:', error);
    }
  }, [value, enhanceText, onChange, subscription]);

  const handleGenerateImage = useCallback(async () => {
    if (!subscription) {
      toast.error("This feature is only available for premium users");
      return;
    }

    if (!onImageGenerate) return;
    
    try {
      const { imageUrl } = await generateImage(value);
      onImageGenerate(imageUrl);
      toast.success('Image generated!');
    } catch (error) {
      console.error('Image generation error:', error);
    }
  }, [value, generateImage, onImageGenerate, subscription]);

  const handleTranslate = useCallback(async () => {
    if (!subscription) {
      toast.error("This feature is only available for premium users");
      return;
    }

    try {
      const { translated } = await translateContent(value, targetLanguage);
      onChange(translated);
      toast.success('Text translated!');
    } catch (error) {
      console.error('Translation error:', error);
    }
  }, [value, targetLanguage, translateContent, onChange, subscription]);

  const handleModerate = useCallback(async () => {
    if (!subscription) {
      toast.error("This feature is only available for premium users");
      return;
    }

    try {
      const { flagged, categories } = await moderateContent(value);
      if (flagged) {
        const flaggedCategories = Object.entries(categories)
          .filter(([_, isFlagged]) => isFlagged)
          .map(([category]) => category)
          .join(', ');
        toast.error(`Content flagged for: ${flaggedCategories}`);
      } else {
        toast.success('Content passed moderation!');
      }
    } catch (error) {
      console.error('Moderation error:', error);
    }
  }, [value, moderateContent, subscription]);

  const handleSpeechSynthesis = useCallback(async () => {
    if (!subscription) {
      toast.error("This feature is only available for premium users");
      return;
    }

    if (!onAudioGenerate) return;
    
    try {
      const { audioData } = await synthesizeSpeech(value);
      onAudioGenerate(audioData);
      toast.success('Audio generated!');
    } catch (error) {
      console.error('Speech synthesis error:', error);
    }
  }, [value, synthesizeSpeech, onAudioGenerate, subscription]);

  if (!subscription) {
    return <PremiumFeatureNotice />;
  }

  return (
    <div className="space-y-4">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write something..."
        className="min-h-[100px]"
      />
      
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleEnhance}
          disabled={isLoading || !value}
        >
          <Wand2 className="h-4 w-4 mr-2" />
          Enhance
        </Button>

        {onImageGenerate && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateImage}
            disabled={isLoading || !value}
          >
            <Image className="h-4 w-4 mr-2" />
            Generate Image
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleTranslate}
          disabled={isLoading || !value}
        >
          <Languages className="h-4 w-4 mr-2" />
          Translate
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleModerate}
          disabled={isLoading || !value}
        >
          <ShieldCheck className="h-4 w-4 mr-2" />
          Check Content
        </Button>

        {onAudioGenerate && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSpeechSynthesis}
            disabled={isLoading || !value}
          >
            <Mic className="h-4 w-4 mr-2" />
            Generate Audio
          </Button>
        )}
      </div>
    </div>
  );
};