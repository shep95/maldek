
import { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

  // Create a premium subscription object that we'll always provide
  const premiumSubscription = {
    tier: {
      name: "Creator",
      monthly_mentions: 999999,
      max_upload_size_mb: 1024,
      supports_animated_avatars: true,
      supports_nft_avatars: true,
      watermark_disabled: true
    },
    status: "active",
    mentions_remaining: 999999,
    is_lifetime: true
  };

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
    subscription: premiumSubscription // Always provide a premium subscription
  });

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
