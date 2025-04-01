
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const SupportSection = () => {
  const supportEmail = "asher@bosley.app";
  
  const handleCopyEmail = () => {
    navigator.clipboard.writeText(supportEmail);
    toast.success("Email copied to clipboard");
  };
  
  const handleEmailClick = () => {
    window.location.href = `mailto:${supportEmail}`;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Support</CardTitle>
        <CardDescription>Get help with your account or report issues</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <p className="text-sm text-muted-foreground">
            If you need assistance, please contact our support team:
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={handleEmailClick}
            >
              <ExternalLink className="h-4 w-4" />
              {supportEmail}
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleCopyEmail}
            >
              Copy
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
