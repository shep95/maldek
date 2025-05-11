
import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { SecurityCodeDialog } from "@/components/settings/SecurityCodeDialog";
import { useEncryption } from "@/providers/EncryptionProvider";
import { Button } from "@/components/ui/button";
import { Shield, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Messages: React.FC = () => {
  const [isSecurityDialogOpen, setIsSecurityDialogOpen] = useState(false);
  const { isEncryptionInitialized, initializeEncryption } = useEncryption();

  const handleSecurityCodeVerified = async (securityCode: string) => {
    try {
      const success = await initializeEncryption(securityCode);
      if (!success) {
        throw new Error("Could not initialize encryption with the provided code");
      }
    } catch (error) {
      console.error("Error initializing encryption:", error);
    }
  };

  return (
    <DashboardLayout>
      <div className="h-full min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-6">Secure Messages</h1>
        
        {!isEncryptionInitialized && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Encryption not enabled</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>Enable end-to-end encryption to view and send secure messages.</span>
              <Button 
                onClick={() => setIsSecurityDialogOpen(true)}
                size="sm"
                variant="outline"
                className="ml-2"
              >
                <Shield className="h-4 w-4 mr-2" />
                Enter Security Code
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
          <div className="bg-card rounded-lg border p-4">
            <h2 className="font-semibold mb-4">Conversations</h2>
            <p className="text-muted-foreground text-sm">
              Your encrypted conversations will appear here.
            </p>
          </div>
          
          <div className="md:col-span-2 bg-card rounded-lg border p-4">
            <div className="flex flex-col h-full">
              <div className="border-b pb-4 mb-4">
                <h2 className="font-semibold">Messages</h2>
              </div>
              <div className="flex-grow">
                {isEncryptionInitialized ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Select a conversation to view messages
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                    <Shield className="h-12 w-12 text-muted-foreground" />
                    <p className="text-center text-muted-foreground">
                      Enter your security code to view encrypted messages
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <SecurityCodeDialog
          isOpen={isSecurityDialogOpen}
          onOpenChange={setIsSecurityDialogOpen}
          action="verify"
          onSuccess={handleSecurityCodeVerified}
        />
      </div>
    </DashboardLayout>
  );
};

export default Messages;
