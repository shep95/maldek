import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useSpaceParticipants = (spaceId: string) => {
  const [participants, setParticipants] = useState<any[]>([]);
  const [speakerRequests, setSpeakerRequests] = useState<any[]>([]);

  const fetchParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('space_participants')
        .select('*, profile:profiles(*)')
        .eq('space_id', spaceId);

      if (error) throw error;
      console.log('Updated participants:', data);
      setParticipants(data || []);
    } catch (error) {
      console.error('Error fetching participants:', error);
      toast.error("Failed to load participants");
    }
  };

  const fetchSpeakerRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('space_speaker_requests')
        .select('*, profile:profiles(*)')
        .eq('space_id', spaceId)
        .eq('status', 'pending');

      if (error) throw error;
      console.log('Updated speaker requests:', data);
      setSpeakerRequests(data || []);
    } catch (error) {
      console.error('Error fetching speaker requests:', error);
      toast.error("Failed to load speaker requests");
    }
  };

  useEffect(() => {
    if (!spaceId) return;

    fetchParticipants();
    fetchSpeakerRequests();

    // Subscribe to real-time updates
    const participantsChannel = supabase.channel('space-participants')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'space_participants',
          filter: `space_id=eq.${spaceId}`
        },
        () => fetchParticipants()
      )
      .subscribe();

    const requestsChannel = supabase.channel('speaker-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'space_speaker_requests',
          filter: `space_id=eq.${spaceId}`
        },
        () => fetchSpeakerRequests()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(participantsChannel);
      supabase.removeChannel(requestsChannel);
    };
  }, [spaceId]);

  return {
    participants,
    speakerRequests,
    refetchParticipants: fetchParticipants,
    refetchRequests: fetchSpeakerRequests
  };
};