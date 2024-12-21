import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type TranslationContextType = {
  currentLanguage: string;
  translate: (text: string) => Promise<string>;
  setLanguage: (language: string) => Promise<void>;
};

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

const translationCache: Record<string, Record<string, string>> = {};

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    const fetchUserLanguage = async () => {
      if (!session?.user?.id) return;

      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('preferred_language')
          .eq('user_id', session.user.id)
          .single();

        if (error) throw error;
        if (data?.preferred_language) {
          setCurrentLanguage(data.preferred_language);
          console.log('Fetched user language:', data.preferred_language);
        }
      } catch (error) {
        console.error('Error fetching user language:', error);
      }
    };

    fetchUserLanguage();
  }, [session?.user?.id]);

  const translate = async (text: string): Promise<string> => {
    if (currentLanguage === 'en') return text;

    // Check cache first
    if (translationCache[currentLanguage]?.[text]) {
      return translationCache[currentLanguage][text];
    }

    try {
      const { data, error } = await supabase.functions.invoke('translate-text', {
        body: { text, targetLanguage: currentLanguage }
      });

      if (error) throw error;

      // Cache the translation
      if (!translationCache[currentLanguage]) {
        translationCache[currentLanguage] = {};
      }
      translationCache[currentLanguage][text] = data.translatedText;

      return data.translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };

  const setLanguage = async (language: string) => {
    if (!session?.user?.id) {
      toast.error('You must be logged in to change language settings');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: session.user.id,
          preferred_language: language,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setCurrentLanguage(language);
      toast.success('Language updated successfully');
    } catch (error) {
      console.error('Error updating language:', error);
      toast.error('Failed to update language');
    }
  };

  return (
    <TranslationContext.Provider value={{ currentLanguage, translate, setLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};