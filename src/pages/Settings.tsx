
import { AccountSection } from "@/components/settings/AccountSection";
import { EmailSection } from "@/components/settings/EmailSection";
import { PasswordSection } from "@/components/settings/PasswordSection";
import { DangerSection } from "@/components/settings/DangerSection";
import { DownloadSection } from "@/components/settings/DownloadSection";
import { LanguageSection } from "@/components/settings/LanguageSection";
import { ThemeToggle } from "@/components/settings/ThemeToggle";
import { MissionSection } from "@/components/settings/MissionSection";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ExternalLink, Mail } from "lucide-react";
import { SecurityCodeSection } from "@/components/settings/SecurityCodeSection";
import { SupportSection } from "@/components/settings/SupportSection";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { useMemo } from "react";

const Settings = () => {
  const navigate = useNavigate();
  const session = useSession();
  
  // Check if current date is after May 28th, 2025
  const shouldShowZorakLink = useMemo(() => {
    const releaseDate = new Date(2025, 4, 28); // May is month 4 (0-indexed)
    const currentDate = new Date();
    return currentDate >= releaseDate;
  }, []);

  const { data: profile } = useQuery({
    queryKey: ['user-security-code', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('security_code')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error checking security code:', error);
        return null;
      }

      return data;
    },
    enabled: !!session?.user?.id,
  });

  return (
    <div className="container max-w-4xl py-8 space-y-8 animate-fade-in bg-background">
      <h1 className="text-3xl font-bold">Settings</h1>
      <MissionSection />
      <ThemeToggle />
      <DownloadSection />
      <LanguageSection />
      <SupportSection />
      <SecurityCodeSection />
      <AccountSection />
      <EmailSection />
      <PasswordSection />
      <DangerSection />
      
      <div className="flex flex-col space-y-4 pt-4 border-t">
        <h2 className="text-xl font-semibold">Legal & Support</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="ghost" 
            className="flex items-center justify-start gap-2 text-muted-foreground"
            onClick={() => navigate('/terms')}
          >
            <ExternalLink className="h-4 w-4" />
            Terms of Service
          </Button>
          <Button 
            variant="ghost" 
            className="flex items-center justify-start gap-2 text-muted-foreground"
            onClick={() => navigate('/support')}
          >
            <Mail className="h-4 w-4" />
            Support
          </Button>
        </div>
      </div>
      
      {shouldShowZorakLink && (
        <div className="flex justify-center pt-6 border-t text-sm text-muted-foreground">
          <a 
            href="https://zorakcorp.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors flex items-center gap-1"
          >
            <span>Managed By Zorak</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  );
};

export default Settings;
