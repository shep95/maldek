
import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [theme, setTheme] = useState<'dark' | 'light' | 'dim'>(
    localStorage.getItem('theme') as 'dark' | 'light' | 'dim' || 'dark'
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'dim');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return { theme, setTheme };
};
