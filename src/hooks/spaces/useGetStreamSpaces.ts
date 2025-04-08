
import { useState, useEffect } from 'react';
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
        
        // Connect user to Stream
        await client.connectUser(
          {
            id: session.user.id,
            name: session.user.user_metadata?.username || 'Anonymous',
            image: session.user.user_metadata?.avatar_url
          },
          session.access_token // Using Supabase token as auth
        );
        
        // Create or join the space channel
        channel = client.channel('livestream', spaceId, {
          name: `Space ${spaceId}`,
          created_by: { id: session.user.id }
        });
        
        await channel.watch();
        
        // Set up event listeners
        channel.on('user.watching.start', (event: any) => {
          console.log('User joined:', event.user);
          setParticipants(prev => [...prev, event.user]);
        });
        
        channel.on('user.watching.stop', (event: any) => {
          console.log('User left:', event.user);
          setParticipants(prev => prev.filter(p => p.id !== event.user.id));
        });
        
        // Get initial participants
        const { users } = await channel.queryMembers({});
        setParticipants(users);
        
        setIsConnected(true);
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
  }, [spaceId, session?.user?.id, session?.access_token]);
  
  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };
  
  return {
    isConnected,
    isLoading,
    error,
    participants,
    isMuted,
    toggleMute
  };
};
