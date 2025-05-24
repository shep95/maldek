
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
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import Settings from "@/pages/Settings";
import Messages from "@/pages/Messages";
import Notifications from "@/pages/Notifications";
import Videos from "@/pages/Videos";
import Profiles from "@/pages/Profiles";
import PostDetail from "@/pages/PostDetail";
import DaarpAI from "@/pages/DaarpAI";
import EmperorChat from "@/pages/EmperorChat";
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
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
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
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/spaces" element={<Spaces />} />
                  <Route path="/subscription" element={<Subscription />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/videos" element={<Videos />} />
                  <Route path="/profiles/:username" element={<Profiles />} />
                  <Route path="/post/:id" element={<PostDetail />} />
                  <Route path="/ai" element={<DaarpAI />} />
                  <Route path="/emperor" element={<EmperorChat />} />
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
