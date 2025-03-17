
import { useCallback } from 'react';
import { useAIServices } from '@/hooks/useAIServices';
import { toast } from 'sonner';

interface UseAIOperationsProps {
  value: string;
  onChange: (value: string) => void;
  onImageGenerate?: (imageUrl: string) => void;
  onAudioGenerate?: (audioUrl: string) => void;
  subscription: any | null;
}

export const useAIOperations = ({
  value,
  onChange,
  onImageGenerate,
  onAudioGenerate,
  subscription
}: UseAIOperationsProps) => {
  const { 
    isLoading,
    enhanceText,
    generateImage,
    translateContent,
    moderateContent,
    synthesizeSpeech
  } = useAIServices();

  // All features are free, so no need to check subscription status
  const checkSubscription = useCallback(() => {
    return true;
  }, []);

  const handleEnhance = useCallback(async () => {
    try {
      const { enhanced } = await enhanceText(value);
      onChange(enhanced);
      toast.success('Text enhanced!');
    } catch (error) {
      console.error('Enhancement error:', error);
    }
  }, [value, enhanceText, onChange]);

  const handleGenerateImage = useCallback(async () => {
    if (!onImageGenerate) return;
    
    try {
      const { imageUrl } = await generateImage(value);
      onImageGenerate(imageUrl);
      toast.success('Image generated!');
    } catch (error) {
      console.error('Image generation error:', error);
    }
  }, [value, generateImage, onImageGenerate]);

  const handleTranslate = useCallback(async (targetLanguage: string) => {
    try {
      const { translated } = await translateContent(value, targetLanguage);
      onChange(translated);
      toast.success('Text translated!');
    } catch (error) {
      console.error('Translation error:', error);
    }
  }, [value, translateContent, onChange]);

  const handleModerate = useCallback(async () => {
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
  }, [value, moderateContent]);

  const handleSpeechSynthesis = useCallback(async () => {
    if (!onAudioGenerate) return;
    
    try {
      const { audioData } = await synthesizeSpeech(value);
      onAudioGenerate(audioData);
      toast.success('Audio generated!');
    } catch (error) {
      console.error('Speech synthesis error:', error);
    }
  }, [value, synthesizeSpeech, onAudioGenerate]);

  return {
    isLoading,
    handleEnhance,
    handleGenerateImage,
    handleTranslate,
    handleModerate,
    handleSpeechSynthesis
  };
};
