
import { useState, useEffect, useRef } from 'react';
import { getStreamClient } from '@/integrations/getstream/client';
import { useSession } from '@supabase/auth-helpers-react';
import { toast } from 'sonner';

export const useGetStreamSpaces = (spaceId: string) => {
  const session = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isMuted, setIsMuted] = useState(true);
  const clientRef = useRef<any>(null);
  const channelRef = useRef<any>(null);
  
  useEffect(() => {
    let client: any = null;
    let channel: any = null;
    
    const connectToSpace = async () => {
      if (!session?.user?.id || !spaceId) return;
      
      try {
        setIsLoading(true);
        client = getStreamClient();
        
        if (!client) {
          throw new Error('Failed to initialize GetStream client');
        }
        
        clientRef.current = client;
        
        // Connect user to Stream
        await client.connectUser(
          {
            id: session.user.id,
            name: session.user.user_metadata?.username || 'Anonymous',
            image: session.user.user_metadata?.avatar_url
          },
          client.devToken(session.user.id) // Using dev token for demo purposes
        );
        
        // Create or join the space channel
        channel = client.channel('livestream', spaceId, {
          name: `Space ${spaceId}`,
          created_by: { id: session.user.id }
        });
        
        channelRef.current = channel;
        
        await channel.watch();
        
        // Set up event listeners
        channel.on('user.watching.start', (event: any) => {
          console.log('User joined:', event.user);
          setParticipants(prev => {
            // Don't add duplicates
            if (prev.some(p => p.id === event.user.id)) {
              return prev;
            }
            return [...prev, event.user];
          });
        });
        
        channel.on('user.watching.stop', (event: any) => {
          console.log('User left:', event.user);
          setParticipants(prev => prev.filter(p => p.id !== event.user.id));
        });
        
        // Get initial participants
        const { users } = await channel.queryMembers({});
        setParticipants(users);
        
        setIsConnected(true);
        setError(null);
        toast.success('Connected to space');
      } catch (err) {
        console.error('Error connecting to space:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        toast.error(`Failed to connect: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    connectToSpace();
    
    return () => {
      // Cleanup
      if (channel) {
        channel.stopWatching();
      }
      
      if (client) {
        client.disconnectUser();
      }
    };
  }, [spaceId, session?.user?.id]);
  
  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };
  
  const sendMessage = async (message: string) => {
    if (!channelRef.current) return;
    
    try {
      await channelRef.current.sendMessage({
        text: message,
        user_id: session?.user?.id,
      });
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  };
  
  return {
    isConnected,
    isLoading,
    error,
    participants,
    isMuted,
    toggleMute,
    sendMessage,
    client: clientRef.current,
    channel: channelRef.current
  };
};
