
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIServiceOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export const useAIServices = () => {
  const [isLoading, setIsLoading] = useState(false);

  const callAIService = async (
    type: string,
    content: string,
    language?: string,
    options?: AIServiceOptions
  ) => {
    setIsLoading(true);
    try {
      console.log('Calling AI service:', { type, content, language });
      
      const { data, error } = await supabase.functions.invoke('ai-service', {
        body: { type, content, language }
      });

      if (error) throw error;
      
      console.log('AI service response:', data);
      options?.onSuccess?.(data);
      return data;
    } catch (error) {
      console.error('AI service error:', error);
      toast.error('AI service error: ' + (error as Error).message);
      options?.onError?.(error as Error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const enhanceText = async (content: string, options?: AIServiceOptions) => {
    return callAIService('enhance-text', content, undefined, options);
  };

  const generateImage = async (prompt: string, options?: AIServiceOptions) => {
    return callAIService('generate-image', prompt, undefined, options);
  };

  const translateContent = async (content: string, targetLanguage: string, options?: AIServiceOptions) => {
    return callAIService('translate', content, targetLanguage, options);
  };

  const moderateContent = async (content: string, mediaUrl?: string, options?: AIServiceOptions) => {
    setIsLoading(true);
    try {
      console.log('Calling content moderation:', { content, mediaUrl });
      
      const { data, error } = await supabase.functions.invoke('moderate-content', {
        body: { content, mediaUrl }
      });

      if (error) throw error;
      
      console.log('Moderation response:', data);
      options?.onSuccess?.(data);
      return data;
    } catch (error) {
      console.error('Moderation error:', error);
      toast.error('Content moderation error: ' + (error as Error).message);
      options?.onError?.(error as Error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const synthesizeSpeech = async (text: string, options?: AIServiceOptions) => {
    return callAIService('synthesize-speech', text, undefined, options);
  };

  return {
    isLoading,
    enhanceText,
    generateImage,
    translateContent,
    moderateContent,
    synthesizeSpeech
  };
};
