import { createContext, useContext, ReactNode } from 'react';
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic';

const BackgroundMusicContext = createContext<ReturnType<typeof useBackgroundMusic> | null>(null);

export const useBackgroundMusicContext = () => {
  const context = useContext(BackgroundMusicContext);
  if (!context) {
    throw new Error('useBackgroundMusicContext must be used within a BackgroundMusicProvider');
  }
  return context;
};

export const BackgroundMusicProvider = ({ children }: { children: ReactNode }) => {
  const backgroundMusic = useBackgroundMusic();

  return (
    <BackgroundMusicContext.Provider value={backgroundMusic}>
      {children}
    </BackgroundMusicContext.Provider>
  );
};