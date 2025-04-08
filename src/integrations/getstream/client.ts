
import { StreamChat } from 'stream-chat';

// Initialize Stream Chat client
export const getStreamClient = () => {
  const apiKey = '5xmj3535vkam';
  
  if (!apiKey) {
    console.error('GetStream API key is missing');
    return null;
  }
  
  return StreamChat.getInstance(apiKey);
};

// Create a server client (for server-side token generation)
export const createServerClient = () => {
  const apiKey = '5xmj3535vkam';
  const apiSecret = 'rtbf2u7zcvube9nhp9r79wbuvftdp88fvfh5bjqa2psz6kp8gkzkeads46wc7jkr';
  
  if (!apiKey || !apiSecret) {
    console.error('GetStream API key or secret is missing');
    return null;
  }
  
  return StreamChat.getInstance(apiKey, apiSecret);
};

// Generate a user token (should be done server-side in production)
export const generateUserToken = (userId: string) => {
  const serverClient = createServerClient();
  if (!serverClient) return null;
  
  return serverClient.createToken(userId);
};
