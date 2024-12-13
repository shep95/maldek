import { Message } from "../types/messageTypes";
import { supabase } from "@/integrations/supabase/client";

interface ConversationContext {
  messages: Message[];
  currentMessage: string;
  imageUrl?: string;
}

export const generateAIResponse = async (context: ConversationContext): Promise<string> => {
  const { messages, currentMessage, imageUrl } = context;
  
  try {
    console.log('Sending request to OpenAI via Edge Function:', { 
      messageCount: messages.length,
      currentMessage,
      hasImage: !!imageUrl 
    });

    const { data, error } = await supabase.functions.invoke('search-web', {
      body: { 
        messages: messages.slice(-10), // Send last 10 messages for context
        currentMessage,
        imageUrl
      }
    });

    if (error) {
      console.error('Error calling search-web function:', error);
      throw error;
    }

    if (data.response) {
      console.log('Received OpenAI response:', {
        responseLength: data.response.length,
        firstFewWords: data.response.slice(0, 50)
      });
      return data.response;
    }

    console.error('No response received from OpenAI');
    return "I apologize, but I'm having trouble processing your request right now. Could you try asking again?";
  } catch (error) {
    console.error('Error generating AI response:', error);
    return "I apologize, but I'm having trouble connecting right now. Please try again in a moment.";
  }
};