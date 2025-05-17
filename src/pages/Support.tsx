
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowLeft, Copy } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SupportPage = () => {
  const navigate = useNavigate();
  const supportEmail = "asher@bosley.app";
  
  const handleCopyEmail = () => {
    navigator.clipboard.writeText(supportEmail);
    toast.success("Email copied to clipboard");
  };
  
  const handleEmailClick = () => {
    window.location.href = `mailto:${supportEmail}`;
  };

  return (
    <div className="container max-w-4xl py-8 space-y-8 animate-fade-in bg-background">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate(-1)}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Support</h1>
      </div>
      
      <Tabs defaultValue="contact" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="contact">Contact Us</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>
        
        <TabsContent value="contact" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>Get help with your account or report issues</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col space-y-2">
                <p>
                  Our support team is available to assist with any questions or issues you might have.
                </p>
                <p className="text-muted-foreground">
                  Please contact us at:
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
                    size="icon"
                    onClick={handleCopyEmail}
                    className="h-10 w-10"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="border-t pt-6 space-y-4">
                <h3 className="font-medium">Response Times</h3>
                <p className="text-sm text-muted-foreground">
                  We typically respond to all inquiries within 24 hours during business days.
                  For urgent matters, please indicate "URGENT" in your email subject line.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="faq" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Quick answers to common questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">How do I reset my security code?</h3>
                <p className="text-sm text-muted-foreground">
                  Security codes cannot be reset automatically. Please contact support via email with your account details.
                </p>
              </div>
              
              <div className="border-t pt-4 space-y-4">
                <h3 className="font-medium">Is my data encrypted?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes, all sensitive data is encrypted both in transit and at rest using industry-standard encryption protocols.
                </p>
              </div>
              
              <div className="border-t pt-4 space-y-4">
                <h3 className="font-medium">How can I delete my account?</h3>
                <p className="text-sm text-muted-foreground">
                  You can request account deletion through the Settings page under the Danger section, or by contacting support directly.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupportPage;
