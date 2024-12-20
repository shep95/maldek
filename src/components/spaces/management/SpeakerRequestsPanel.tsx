import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SpeakerRequestsPanelProps {
  spaceId: string;
  isHost: boolean;
  onRequestHandled: () => void;
}

export const SpeakerRequestsPanel = ({
  spaceId,
  isHost,
  onRequestHandled
}: SpeakerRequestsPanelProps) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      const { data, error } = await supabase
        .from('space_speaker_requests')
        .select(`
          *,
          profile:profiles(username, avatar_url)
        `)
        .eq('space_id', spaceId)
        .eq('status', 'pending')
        .order('requested_at', { ascending: true });

      if (error) {
        console.error('Error fetching speaker requests:', error);
        toast.error('Failed to load speaker requests');
        return;
      }

      setRequests(data || []);
    };

    fetchRequests();

    // Subscribe to new requests
    const channel = supabase
      .channel(`speaker_requests:${spaceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'space_speaker_requests',
          filter: `space_id=eq.${spaceId}`
        },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [spaceId]);

  const handleRequest = async (requestId: string, userId: string, accept: boolean) => {
    setIsLoading(true);
    try {
      if (accept) {
        const { error: updateError } = await supabase
          .from('space_participants')
          .update({ role: 'speaker' })
          .eq('space_id', spaceId)
          .eq('user_id', userId);

        if (updateError) throw updateError;
      }

      const { error } = await supabase
        .from('space_speaker_requests')
        .update({
          status: accept ? 'accepted' : 'rejected',
          resolved_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast.success(`Speaker request ${accept ? 'accepted' : 'rejected'}`);
      onRequestHandled();
    } catch (error) {
      console.error('Error handling speaker request:', error);
      toast.error('Failed to handle request');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isHost) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Only hosts can view and manage speaker requests
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px] w-full p-4">
      {requests.length === 0 ? (
        <div className="text-center text-muted-foreground">
          No pending speaker requests
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={request.profile?.avatar_url} />
                  <AvatarFallback>
                    {request.profile?.username?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {request.profile?.username}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Requested {new Date(request.requested_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => handleRequest(request.id, request.user_id, false)}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-green-500"
                  onClick={() => handleRequest(request.id, request.user_id, true)}
                  disabled={isLoading}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </ScrollArea>
  );
};