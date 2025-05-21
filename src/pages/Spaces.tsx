import { useSession } from '@supabase/auth-helpers-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useState } from "react";
import { CreateSpaceDialog } from "@/components/spaces/CreateSpaceDialog";
import { SpaceCard } from "@/components/spaces/SpaceCard";
import { SpaceHistoryCard } from "@/components/spaces/SpaceHistoryCard";
import { TwitterSpaceDialog } from "@/components/spaces/TwitterSpaceDialog";

const Spaces = () => {
  const session = useSession();
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [isSpaceDialogOpen, setIsSpaceDialogOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: subscription } = useQuery({
    queryKey: ['user-subscription'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data: subscription, error } = await supabase
          .from('user_subscriptions')
          .select(`
            *,
            tier:subscription_tiers(*)
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (error) throw error;
        return subscription;
      } catch (error) {
        console.error("Error in subscription query:", error);
        return null;
      }
    }
  });

  const { data: liveSpaces, refetch: refetchSpaces } = useQuery({
    queryKey: ['live-spaces'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spaces')
        .select(`
          *,
          host:profiles!spaces_host_id_fkey(
            id,
            username,
            avatar_url
          ),
          participants:space_participants(
            user_id,
            role,
            profile:profiles(
              username,
              avatar_url
            )
          )
        `)
        .eq('status', 'live')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const { data: spaceHistory } = useQuery({
    queryKey: ['space-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spaces')
        .select(`
          *,
          host:profiles!spaces_host_id_fkey(
            id,
            username,
            avatar_url
          ),
          participants:space_participants(
            user_id,
            role,
            profile:profiles(
              username,
              avatar_url
            )
          )
        `)
        .eq('status', 'ended')
        .order('ended_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const handleCreateSpace = () => {
    if (!subscription) {
      toast.error("You need a premium subscription to create spaces", {
        action: {
          label: "Get Premium",
          onClick: () => window.location.href = '/subscription'
        }
      });
      return;
    }
    setIsCreateOpen(true);
  };

  const handleJoinSpace = async (spaceId: string) => {
    try {
      const { data: existingParticipant } = await supabase
        .from('space_participants')
        .select('role')
        .eq('space_id', spaceId)
        .eq('user_id', session?.user?.id)
        .maybeSingle();

      if (!existingParticipant) {
        const { error: joinError } = await supabase
          .from('space_participants')
          .insert({
            space_id: spaceId,
            user_id: session?.user?.id,
            role: 'listener'
          });

        if (joinError) throw joinError;
      }

      setSelectedSpaceId(spaceId);
      setIsSpaceDialogOpen(true);
    } catch (error) {
      console.error("Error joining space:", error);
      toast.error("Failed to join space");
    }
  };

  const handleLeaveSpace = async (spaceId: string) => {
    try {
      const { error } = await supabase
        .from('space_participants')
        .delete()
        .eq('space_id', spaceId)
        .eq('user_id', session?.user?.id);

      if (error) throw error;
      toast.success("Left space successfully");
      refetchSpaces();
    } catch (error) {
      console.error("Error leaving space:", error);
      toast.error("Failed to leave space");
    }
  };

  const handlePurchaseRecording = async (spaceId: string) => {
    try {
      const response = await fetch('/api/create-recording-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ spaceId })
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Error initiating recording purchase:", error);
      toast.error("Failed to initiate purchase");
    }
  };

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <div className="flex justify-center">
        <main className="w-full max-w-3xl px-4 py-6 md:py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-foreground">Spaces</h1>
            <Button 
              onClick={handleCreateSpace}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Space
            </Button>
          </div>

          <Tabs defaultValue="live" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="live" className="flex-1">Live Spaces</TabsTrigger>
              <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
            </TabsList>

            <TabsContent value="live" className="mt-4 space-y-4">
              {!liveSpaces?.length ? (
                <p className="text-muted-foreground text-center py-8">
                  No live spaces at the moment
                </p>
              ) : (
                <div className="space-y-4">
                  {liveSpaces.map((space) => (
                    <SpaceCard
                      key={space.id}
                      space={space}
                      onJoin={handleJoinSpace}
                      onLeave={handleLeaveSpace}
                      currentUserId={session?.user?.id}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-4 space-y-4">
              {!spaceHistory?.length ? (
                <p className="text-muted-foreground text-center py-8">
                  No space history yet
                </p>
              ) : (
                <div className="space-y-4">
                  {spaceHistory.map((space) => (
                    <SpaceHistoryCard
                      key={space.id}
                      space={space}
                      onPurchaseRecording={handlePurchaseRecording}
                      currentUserId={session?.user?.id}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {selectedSpaceId && (
            <TwitterSpaceDialog
              isOpen={isSpaceDialogOpen}
              onOpenChange={setIsSpaceDialogOpen}
              spaceId={selectedSpaceId}
            />
          )}

          <CreateSpaceDialog
            isOpen={isCreateOpen}
            onOpenChange={setIsCreateOpen}
            onSpaceCreated={refetchSpaces}
          />
        </main>
      </div>
    </div>
  );
};

export default Spaces;
