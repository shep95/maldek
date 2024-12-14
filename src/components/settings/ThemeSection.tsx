import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Toggle } from "@/components/ui/toggle";

export const ThemeSection = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme Settings</CardTitle>
        <CardDescription>Customize the app's appearance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Dark Mode</Label>
            <p className="text-sm text-muted-foreground">
              Switch between light and dark themes
            </p>
          </div>
          <Toggle
            pressed={theme === 'dark'}
            onPressedChange={() => toggleTheme()}
            className="ml-4"
          >
            {theme === 'dark' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Toggle>
        </div>
      </CardContent>
    </Card>
  );
};