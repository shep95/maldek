
import { Moon, Sun, MonitorSmartphone } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme Settings</CardTitle>
        <CardDescription>Choose between light, dark, and dim modes</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-4">
        <Button
          variant={theme === 'light' ? 'default' : 'outline'}
          onClick={() => setTheme('light')}
          className="flex-1"
        >
          <Sun className="h-4 w-4 mr-2" />
          Light
        </Button>
        <Button
          variant={theme === 'dark' ? 'default' : 'outline'}
          onClick={() => setTheme('dark')}
          className="flex-1"
        >
          <Moon className="h-4 w-4 mr-2" />
          Dark
        </Button>
        <Button
          variant={theme === 'dim' ? 'default' : 'outline'}
          onClick={() => setTheme('dim')}
          className="flex-1"
        >
          <MonitorSmartphone className="h-4 w-4 mr-2" />
          Dim
        </Button>
      </CardContent>
    </Card>
  );
};
