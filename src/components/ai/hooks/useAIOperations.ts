
import { useCallback } from 'react';
import { useAIServices } from '@/hooks/useAIServices';
import { toast } from 'sonner';

interface UseAIOperationsProps {
  value: string;
  onChange: (value: string) => void;
  onImageGenerate?: (imageUrl: string) => void;
  onAudioGenerate?: (audioUrl: string) => void;
  hasSubscription: boolean;
}

export const useAIOperations = ({
  value,
  onChange,
  onImageGenerate,
  onAudioGenerate,
  hasSubscription
}: UseAIOperationsProps) => {
  const { 
    isLoading,
    enhanceText,
    generateImage,
    translateContent,
    moderateContent,
    synthesizeSpeech
  } = useAIServices();

  const checkSubscription = useCallback(() => {
    if (!hasSubscription) {
      toast.error("This feature requires an active subscription", {
        description: "Please subscribe to access premium AI features",
        action: {
          label: "Subscribe",
          onClick: () => window.location.href = "/subscription",
        },
      });
      return false;
    }
    return true;
  }, [hasSubscription]);

  const handleEnhance = useCallback(async () => {
    if (!checkSubscription()) return;

    try {
      const { enhanced } = await enhanceText(value);
      onChange(enhanced);
      toast.success('Text enhanced!');
    } catch (error) {
      console.error('Enhancement error:', error);
    }
  }, [value, enhanceText, onChange, checkSubscription]);

  const handleGenerateImage = useCallback(async () => {
    if (!checkSubscription() || !onImageGenerate) return;
    
    try {
      const { imageUrl } = await generateImage(value);
      onImageGenerate(imageUrl);
      toast.success('Image generated!');
    } catch (error) {
      console.error('Image generation error:', error);
    }
  }, [value, generateImage, onImageGenerate, checkSubscription]);

  const handleTranslate = useCallback(async (targetLanguage: string) => {
    if (!checkSubscription()) return;

    try {
      const { translated } = await translateContent(value, targetLanguage);
      onChange(translated);
      toast.success('Text translated!');
    } catch (error) {
      console.error('Translation error:', error);
    }
  }, [value, translateContent, onChange, checkSubscription]);

  const handleModerate = useCallback(async (mediaUrl?: string) => {
    if (!checkSubscription()) return;

    try {
      const { is_safe, details } = await moderateContent(value, mediaUrl);
      if (!is_safe) {
        const flaggedCategories = Object.entries(details.categories || {})
          .filter(([_, isFlagged]) => isFlagged)
          .map(([category]) => category)
          .join(', ');
        toast.error(`Content flagged for: ${flaggedCategories || 'inappropriate content'}`);
      } else {
        toast.success('Content passed moderation!');
      }
      return is_safe;
    } catch (error) {
      console.error('Moderation error:', error);
      return false;
    }
  }, [value, moderateContent, checkSubscription]);

  const handleSpeechSynthesis = useCallback(async () => {
    if (!checkSubscription() || !onAudioGenerate) return;
    
    try {
      // The synthesizeSpeech function now uses Web Speech API directly
      // and doesn't return audioData, so we don't need to destructure it
      await synthesizeSpeech(value);
      // Since Web Speech API plays directly, we don't need to pass audio data
      onAudioGenerate(null);
      toast.success('Audio generated!');
    } catch (error) {
      console.error('Speech synthesis error:', error);
    }
  }, [value, synthesizeSpeech, onAudioGenerate, checkSubscription]);

  return {
    isLoading,
    handleEnhance,
    handleGenerateImage,
    handleTranslate,
    handleModerate,
    handleSpeechSynthesis
  };
};
