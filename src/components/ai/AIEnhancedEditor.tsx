
import { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@supabase/auth-helpers-react";
import { AIActionButtons } from './components/AIActionButtons';
import { useAIOperations } from './hooks/useAIOperations';
import { PremiumFeatureNotice } from './components/PremiumFeatureNotice';
import { useSubscription } from "@/hooks/useSubscription";

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
  const { subscribed, features } = useSubscription();

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
    hasSubscription: subscribed
  });

  if (!subscribed || !features.canUseAI) {
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
