
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
import { EncryptionProvider } from "@/providers/EncryptionProvider";

// Enhanced query client configuration for massive scale
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // Reduced retries to prevent cascade failures
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes stale time
      gcTime: 1000 * 60 * 10, // 10 minutes garbage collection
      // Add network mode for better offline handling
      networkMode: 'online',
    },
    mutations: {
      retry: 1, // Minimal retries for mutations
      networkMode: 'online',
    },
  },
});

const App = () => {
  useEffect(() => {
    // Initialize theme from localStorage or default to dark
    try {
      const theme = localStorage.getItem('theme') || 'dark';
      document.documentElement.classList.add(theme);
    } catch (error) {
      console.warn('Error setting theme:', error);
      document.documentElement.classList.add('dark');
    }

    // Initialize autoplay state with error handling
    try {
      const shouldAutoplay = localStorage.getItem('background_music_autoplay') !== 'false';
      if (shouldAutoplay) {
        localStorage.setItem('background_music_autoplay', 'true');
      }
    } catch (error) {
      console.warn('Error setting autoplay:', error);
    }

    // Add global error handler for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      // Prevent the error from crashing the app
      event.preventDefault();
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Add global error handler for errors
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      // Log error but don't crash the app
    };

    window.addEventListener('error', handleError);

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
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
              <EncryptionProvider>
                <AuthenticationWrapper>
                  <AppRoutes />
                </AuthenticationWrapper>
              </EncryptionProvider>
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
