
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "next-themes"
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "sonner";
import Spaces from "@/pages/Spaces";
import Subscription from "@/pages/Subscription";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState } from "react";
import { initializeAppCenter, checkForUpdate } from "@/utils/appCenterConfig";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useSession } from "@supabase/auth-helpers-react";
import { SpaceProvider } from "@/contexts/SpaceContext";
import { SpaceMiniPlayer } from "@/components/spaces/SpaceMiniPlayer";
import Index from "@/pages/Index";

const queryClient = new QueryClient()

const AuthenticationWrapper = ({ children }: { children: React.ReactNode }) => {
  const session = useSession();
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [latestVersion, setLatestVersion] = useState<string | null>(null);

  useEffect(() => {
    initializeAppCenter();

    const check = async () => {
      const update = await checkForUpdate();
      if (update && update.version !== import.meta.env.VITE_APP_VERSION) {
        setUpdateAvailable(true);
        setLatestVersion(update.version);
      }
    };

    check();
  }, []);

  if (!session) {
    return (
      <Routes>
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/" element={<Index />} />
      </Routes>
    );
  }

  return (
    <>
      {children}
      <AlertDialog open={updateAvailable}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Available</AlertDialogTitle>
            <AlertDialogDescription>
              A new version of the app is available. Please update to version {latestVersion} to get the latest features and bug fixes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => window.location.reload()}>Update</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionContextProvider supabaseClient={supabase}>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <SpaceProvider>
            <Router>
              <AuthenticationWrapper>
                <Toaster />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/spaces" element={<Spaces />} />
                  <Route path="/subscription" element={<Subscription />} />
                </Routes>
                <SpaceMiniPlayer />
              </AuthenticationWrapper>
            </Router>
          </SpaceProvider>
        </ThemeProvider>
      </SessionContextProvider>
    </QueryClientProvider>
  );
}

export default App;
