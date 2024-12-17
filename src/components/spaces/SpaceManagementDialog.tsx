import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, MicOff, UserPlus, UserMinus, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";

interface SpaceManagementDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  spaceId: string;
  isHost: boolean;
}

export const SpaceManagementDialog = ({
  isOpen,
  onOpenChange,
  spaceId,
  isHost
}: SpaceManagementDialogProps) => {
  const session = useSession();
  const [isMuted, setIsMuted] = useState(true);
  const [activeTab, setActiveTab] = useState("participants");

  const handleMicToggle = () => {
    console.log("Toggling microphone");
    setIsMuted(!isMuted);
    toast.success(isMuted ? "Microphone unmuted" : "Microphone muted");
  };

  const handleRequestToSpeak = async () => {
    try {
      const { error } = await supabase
        .from('space_speaker_requests')
        .insert({
          space_id: spaceId,
          user_id: session?.user?.id,
          status: 'pending'
        });

      if (error) throw error;
      toast.success("Request to speak sent!");
    } catch (error) {
      console.error('Error requesting to speak:', error);
      toast.error("Failed to send request");
    }
  };

  const handleRemoveSpeaker = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('space_participants')
        .update({ role: 'listener' })
        .eq('space_id', spaceId)
        .eq('user_id', userId);

      if (error) throw error;
      toast.success("Speaker removed");
    } catch (error) {
      console.error('Error removing speaker:', error);
      toast.error("Failed to remove speaker");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="participants">
              <Users className="h-4 w-4 mr-2" />
              Participants
            </TabsTrigger>
            <TabsTrigger value="requests">
              <UserPlus className="h-4 w-4 mr-2" />
              Requests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="participants" className="mt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Your Controls</h3>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleMicToggle}
                  className={isMuted ? "bg-destructive/10" : "bg-green-500/10"}
                >
                  {isMuted ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {!isHost && (
                <Button 
                  onClick={handleRequestToSpeak}
                  className="w-full"
                  variant="secondary"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Request to Speak
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="requests" className="mt-4">
            {isHost ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Speaker Requests</h3>
                {/* Speaker requests will be implemented here */}
                <p className="text-muted-foreground text-sm">
                  No pending requests
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Only hosts can view speaker requests
              </p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};