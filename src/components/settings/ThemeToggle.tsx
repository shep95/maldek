
import { Moon, Sun, MonitorSmartphone } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSession } from "@supabase/auth-helpers-react";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const session = useSession();

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'dim') => {
    setTheme(newTheme);

    if (session?.user?.id) {
      try {
        const { error } = await supabase
          .from('user_settings')
          .upsert({
            user_id: session.user.id,
            theme: newTheme,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      } catch (error) {
        console.error('Error saving theme preference:', error);
        toast.error("Failed to save theme preference");
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme Settings</CardTitle>
        <CardDescription>Choose between light, dark, and dim modes</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-4">
        <Button
          variant={theme === 'light' ? 'default' : 'outline'}
          onClick={() => handleThemeChange('light')}
          className="flex-1"
        >
          <Sun className="h-4 w-4 mr-2" />
          Light
        </Button>
        <Button
          variant={theme === 'dark' ? 'default' : 'outline'}
          onClick={() => handleThemeChange('dark')}
          className="flex-1"
        >
          <Moon className="h-4 w-4 mr-2" />
          Dark
        </Button>
        <Button
          variant={theme === 'dim' ? 'default' : 'outline'}
          onClick={() => handleThemeChange('dim')}
          className="flex-1"
        >
          <MonitorSmartphone className="h-4 w-4 mr-2" />
          Dim
        </Button>
      </CardContent>
    </Card>
  );
};
