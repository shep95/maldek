import { AuthenticationWrapper } from "@/components/auth/AuthenticationWrapper";
import { AppRoutes } from "@/components/routing/AppRoutes";
import { Toaster } from "@/components/ui/sonner";
import { TranslationProvider } from "@/contexts/TranslationContext";

function App() {
  return (
    <TranslationProvider>
      <AuthenticationWrapper>
        <AppRoutes />
        <Toaster />
      </AuthenticationWrapper>
    </TranslationProvider>
  );
}

export default App;