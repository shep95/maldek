import { useSession } from '@supabase/auth-helpers-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useState } from "react";
import { SpaceManagementDialog } from "@/components/spaces/SpaceManagementDialog";
import { CreateSpaceDialog } from "@/components/spaces/CreateSpaceDialog";
import { SpaceCard } from "@/components/spaces/SpaceCard";

const Spaces = () => {
  const session = useSession();
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Fetch user's subscription status
  const { data: subscription } = useQuery({
    queryKey: ['user-subscription'],
    queryFn: async () => {
      try {
        console.log("Fetching user subscription data...");
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log("No user found");
          return null;
        }

        const { data: subscription, error } = await supabase
          .from('user_subscriptions')
          .select(`
            *,
            tier:subscription_tiers(*)
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (error) {
          console.error("Error fetching subscription:", error);
          return null;
        }

        console.log("Subscription data:", subscription);
        return subscription;
      } catch (error) {
        console.error("Error in subscription query:", error);
        return null;
      }
    }
  });

  // Fetch live spaces with host and participant count
  const { data: liveSpaces, refetch: refetchSpaces } = useQuery({
    queryKey: ['live-spaces'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spaces')
        .select(`
          *,
          host:profiles!spaces_host_id_fkey(
            username,
            avatar_url
          ),
          participants_count
        `)
        .eq('status', 'live')
        .order('created_at', { ascending: false });

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

  const handleJoinSpace = (spaceId: string) => {
    console.log("Joining space:", spaceId);
    setSelectedSpaceId(spaceId);
    setIsManagementOpen(true);
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
              {liveSpaces?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No live spaces at the moment
                </p>
              ) : (
                <div className="space-y-4">
                  {liveSpaces?.map((space) => (
                    <SpaceCard
                      key={space.id}
                      space={space}
                      onJoin={handleJoinSpace}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-4 space-y-4">
              <p className="text-muted-foreground text-center py-8">
                You haven't joined any spaces yet
              </p>
            </TabsContent>
          </Tabs>

          {selectedSpaceId && (
            <SpaceManagementDialog
              isOpen={isManagementOpen}
              onOpenChange={setIsManagementOpen}
              spaceId={selectedSpaceId}
              isHost={false}
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