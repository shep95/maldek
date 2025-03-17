import { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PremiumFeatureNotice } from './components/PremiumFeatureNotice';
import { AIActionButtons } from './components/AIActionButtons';
import { useAIOperations } from './hooks/useAIOperations';

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
  const [targetLanguage] = useState('es');

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

  const {
    isLoading,
    handleEnhance,
    handleGenerateImage,
    handleTranslate,
    handleModerate,
    handleSpeechSynthesis
  } = useAIOperations({
    value,
    onChange,
    onImageGenerate,
    onAudioGenerate,
    subscription
  });

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
      
      <AIActionButtons
        isLoading={isLoading}
        hasContent={!!value}
        onEnhance={handleEnhance}
        onGenerateImage={onImageGenerate ? handleGenerateImage : undefined}
        onTranslate={() => handleTranslate(targetLanguage)}
        onModerate={handleModerate}
        onSpeechSynthesis={onAudioGenerate ? handleSpeechSynthesis : undefined}
      />
    </div>
  );
};