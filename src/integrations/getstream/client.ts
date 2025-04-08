
import { StreamChat } from 'stream-chat';

// Initialize Stream Chat client
export const getStreamClient = () => {
  const apiKey = import.meta.env.VITE_GETSTREAM_API_KEY;
  
  if (!apiKey) {
    console.error('GetStream API key is missing');
    return null;
  }
  
  return StreamChat.getInstance(apiKey);
};
