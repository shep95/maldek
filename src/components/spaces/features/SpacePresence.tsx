import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SpacePresenceProps {
  spaceId: string;
  userId: string;
  onPresenceUpdate: (presences: any[]) => void;
}

export const useSpacePresence = ({ 
  spaceId, 
  userId,
  onPresenceUpdate 
}: SpacePresenceProps) => {
  const [presences, setPresences] = useState<any[]>([]);

  useEffect(() => {
    const channel = supabase.channel(`space:${spaceId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        console.log('Presence state synchronized:', state);
        const presenceArray = Object.values(state).flat();
        setPresences(presenceArray);
        onPresenceUpdate(presenceArray);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', newPresences);
        toast.success(`${newPresences[0]?.username || 'Someone'} joined the space`);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', leftPresences);
        toast.info(`${leftPresences[0]?.username || 'Someone'} left the space`);
      });

    // Track user's presence
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        const presence = {
          user_id: userId,
          online_at: new Date().toISOString(),
          speaking: false
        };
        
        await channel.track(presence);
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [spaceId, userId]);

  return presences;
};