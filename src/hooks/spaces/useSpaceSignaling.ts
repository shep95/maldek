import { useRef, useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';

interface SignalingState {
  isConnected: boolean;
  error: string | null;
}

export const useSpaceSignaling = (spaceId: string) => {
  const session = useSession();
  const [state, setState] = useState<SignalingState>({
    isConnected: false,
    error: null
  });
  const websocketRef = useRef<WebSocket | null>(null);

  const connectToSignalingServer = async () => {
    try {
      if (!session?.access_token) {
        throw new Error('No access token available');
      }

      const wsUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/spaces-signaling?spaceId=${spaceId}&jwt=${session.access_token}`;
      websocketRef.current = new WebSocket(wsUrl);

      websocketRef.current.onopen = () => {
        console.log('Connected to signaling server');
        setState(prev => ({ ...prev, isConnected: true }));
      };

      websocketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setState(prev => ({ ...prev, error: 'Connection error' }));
      };

      websocketRef.current.onclose = () => {
        console.log('Disconnected from signaling server');
        setState(prev => ({ ...prev, isConnected: false }));
      };

    } catch (err) {
      console.error('Error connecting to space:', err);
      setState(prev => ({ ...prev, error: err instanceof Error ? err.message : 'Unknown error' }));
    }
  };

  const sendSignalingMessage = (message: any) => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify(message));
    }
  };

  const cleanup = () => {
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
  };

  return {
    ...state,
    websocketRef,
    connectToSignalingServer,
    sendSignalingMessage,
    cleanup
  };
};