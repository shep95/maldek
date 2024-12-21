import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
];

export const LanguageSection = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');

  useEffect(() => {
    const fetchUserLanguage = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_settings')
        .select('preferred_language')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching language settings:', error);
        return;
      }

      if (data) {
        setSelectedLanguage(data.preferred_language);
      }
    };

    fetchUserLanguage();
  }, []);

  const handleLanguageChange = async (language: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to change settings");
        return;
      }

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          preferred_language: language,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setSelectedLanguage(language);
      toast.success("Language preference updated");
    } catch (error) {
      console.error('Error updating language:', error);
      toast.error("Failed to update language preference");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Language Settings</CardTitle>
        <CardDescription>Choose your preferred language for translations</CardDescription>
      </CardHeader>
      <CardContent>
        <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};