
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";

export const MissionSection = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Our Mission
        </CardTitle>
        <CardDescription>Why we built Bosley</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-foreground font-medium">
            The mission behind Bosley is simple:
          </p>
          <p className="text-accent font-semibold text-lg">
            A free social media platform — with no ads, no bugs, and total privacy.
          </p>
          
          <div className="space-y-2 mt-4">
            <p className="text-foreground">No cookies.</p>
            <p className="text-foreground">No device permissions.</p>
            <p className="text-foreground">We don't even collect your IP address when you sign up or log in.</p>
          </div>
          
          <p className="text-accent font-medium text-lg mt-4">
            Pure connection. No surveillance.
          </p>
          
          <div className="mt-4 space-y-2">
            <p className="text-foreground">
              Bosley is a platform built for humanity,<br />
              by real humans —<br />
              not corporations, not algorithms, and definitely not spyware.
            </p>
          </div>
          
          <p className="text-foreground font-semibold mt-4">
            This isn't just an app.<br />
            It's a statement.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
