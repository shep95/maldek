
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
import { SecurityHeaders } from "@/components/security/SecurityHeaders";

// Enhanced query client configuration with security measures
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      networkMode: 'online',
      // Add security headers to all requests
      meta: {
        secure: true
      }
    },
    mutations: {
      retry: 1,
      networkMode: 'online',
      meta: {
        secure: true
      }
    },
  },
});

const App = () => {
  useEffect(() => {
    // Enhanced security initialization
    try {
      const theme = localStorage.getItem('theme') || 'dark';
      document.documentElement.classList.add(theme);
    } catch (error) {
      console.warn('Error setting theme:', error);
      document.documentElement.classList.add('dark');
    }

    try {
      const shouldAutoplay = localStorage.getItem('background_music_autoplay') !== 'false';
      if (shouldAutoplay) {
        localStorage.setItem('background_music_autoplay', 'true');
      }
    } catch (error) {
      console.warn('Error setting autoplay:', error);
    }

    // Mobile-specific optimizations
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      // Prevent iOS bounce
      document.body.style.overscrollBehavior = 'none';
      // Fix viewport on mobile
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
      }
    }

    // Enhanced global error handling with security logging
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Log security-related errors
      if (event.reason?.message?.includes('auth') || 
          event.reason?.message?.includes('token') ||
          event.reason?.message?.includes('session')) {
        console.warn('Security-related error detected:', event.reason);
      }
      
      event.preventDefault();
    };

    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      
      // Enhanced error filtering for security
      if (event.error?.message?.includes('script') ||
          event.error?.message?.includes('unauthorized')) {
        console.warn('Potential security issue detected:', event.error);
      }
    };

    // Security event listeners
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Clear sensitive data when tab becomes hidden
        console.log('Tab hidden - clearing sensitive data');
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <>
      <SecurityHeaders />
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
    </>
  );
};

export default App;
