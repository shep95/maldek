
import { useState, useEffect } from 'react';
import { useUserSettings } from './useUserSettings';
import { useSession } from '@supabase/auth-helpers-react';

type ThemeType = 'dark' | 'light';

export const useTheme = () => {
  const session = useSession();
  const { data: userSettings } = useUserSettings();
  const [theme, setTheme] = useState<ThemeType>(
    () => {
      // First try to get from localStorage
      const savedTheme = localStorage.getItem('theme') as ThemeType;
      if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
      
      // If not in localStorage but we have user settings, use that
      if (userSettings?.theme === 'light' || userSettings?.theme === 'dark') 
        return userSettings.theme as ThemeType;
      
      // Default to dark if nothing is set
      return 'dark';
    }
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Update theme when user settings load
  useEffect(() => {
    if (userSettings?.theme && !localStorage.getItem('theme')) {
      if (userSettings.theme === 'light' || userSettings.theme === 'dark') {
        setTheme(userSettings.theme as ThemeType);
      }
    }
  }, [userSettings]);

  return { theme, setTheme };
};
