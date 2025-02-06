
import { useState, useEffect } from 'react';
import { useUserSettings } from './useUserSettings';
import { useSession } from '@supabase/auth-helpers-react';

export const useTheme = () => {
  const session = useSession();
  const { data: userSettings } = useUserSettings();
  const [theme, setTheme] = useState<'dark' | 'light' | 'dim'>(
    () => {
      // First try to get from localStorage
      const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | 'dim';
      if (savedTheme) return savedTheme;
      
      // If not in localStorage but we have user settings, use that
      if (userSettings?.theme) return userSettings.theme as 'dark' | 'light' | 'dim';
      
      // Default to dark if nothing is set
      return 'dark';
    }
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'dim');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Update theme when user settings load
  useEffect(() => {
    if (userSettings?.theme && !localStorage.getItem('theme')) {
      setTheme(userSettings.theme as 'dark' | 'light' | 'dim');
    }
  }, [userSettings]);

  return { theme, setTheme };
};
