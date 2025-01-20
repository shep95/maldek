import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import { AuthenticationWrapper } from "@/components/auth/AuthenticationWrapper";
import { AppRoutes } from "@/components/routing/AppRoutes";
import { useEffect } from "react";
import { BackgroundMusicProvider } from "@/components/providers/BackgroundMusicProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  useEffect(() => {
    // Initialize theme from localStorage or default to dark
    const theme = localStorage.getItem('theme') || 'dark';
    document.documentElement.classList.add(theme);

    // Initialize autoplay state
    const shouldAutoplay = localStorage.getItem('background_music_autoplay') !== 'false';
    if (shouldAutoplay) {
      localStorage.setItem('background_music_autoplay', 'true');
    }

    // Load user's background image if it exists
    const loadBackgroundImage = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const { data: backgroundImage } = await supabase
          .from('user_background_images')
          .select('image_url')
          .eq('user_id', session.user.id)
          .single();

        if (backgroundImage?.image_url) {
          document.body.style.backgroundImage = `url(${backgroundImage.image_url})`;
          document.body.style.backgroundSize = 'cover';
          document.body.style.backgroundPosition = 'center';
          document.body.style.backgroundAttachment = 'fixed';
        }
      }
    };

    loadBackgroundImage();
  }, []);

  return (
    <SessionContextProvider 
      supabaseClient={supabase} 
      initialSession={null}
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <TooltipProvider>
            <BackgroundMusicProvider>
              <AuthenticationWrapper>
                <AppRoutes />
              </AuthenticationWrapper>
            </BackgroundMusicProvider>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </SessionContextProvider>
  );
};

export default App;