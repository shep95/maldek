
import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { MessagePanel } from "@/components/messages/MessagePanel";
import { ConversationList } from "@/components/messages/ConversationList";
import { useSession } from "@supabase/auth-helpers-react";
import { useEncryption } from "@/providers/EncryptionProvider";
import { SecurityCodeDialog } from "@/components/settings/SecurityCodeDialog";

const Messages = () => {
  const session = useSession();
  const { isEncryptionInitialized } = useEncryption();
  const [securityDialogOpen, setSecurityDialogOpen] = useState(!isEncryptionInitialized);

  // If user isn't authenticated or encryption isn't set up, show security setup
  if (!isEncryptionInitialized) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <SecurityCodeDialog 
            open={securityDialogOpen} 
            onOpenChange={setSecurityDialogOpen}
            mode="setup"
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex-1 flex h-[calc(100vh-60px)]">
        <div className="w-1/3 border-r border-border">
          <ConversationList />
        </div>
        <div className="w-2/3">
          <MessagePanel userId={session?.user?.id || null} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Messages;
