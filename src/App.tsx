import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import { AuthenticationWrapper } from "@/components/auth/AuthenticationWrapper";
import { AppRoutes } from "@/components/routing/AppRoutes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <TooltipProvider>
            <AuthenticationWrapper queryClient={queryClient}>
              <AppRoutes />
            </AuthenticationWrapper>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </SessionContextProvider>
  );
};

export default App;