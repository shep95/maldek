import { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';

export const useTranslatedText = (text: string) => {
  const { translate, currentLanguage } = useTranslation();
  const [translatedText, setTranslatedText] = useState(text);

  useEffect(() => {
    const translateText = async () => {
      const result = await translate(text);
      setTranslatedText(result);
    };

    translateText();
  }, [text, currentLanguage, translate]);

  return translatedText;
};