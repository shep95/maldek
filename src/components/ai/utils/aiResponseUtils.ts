import { Message } from "../types/messageTypes";
import { supabase } from "@/integrations/supabase/client";

interface ConversationContext {
  messages: Message[];
  currentMessage: string;
}

export const generateAIResponse = async (context: ConversationContext): Promise<string> => {
  const { messages, currentMessage } = context;
  
  // Handle mathematical expressions separately for quick responses
  if (currentMessage.match(/[0-9+\-*/()]/)) {
    try {
      const sanitizedExpression = currentMessage.replace(/[^0-9+\-*/().]/g, '');
      const result = Function('"use strict";return (' + sanitizedExpression + ')')();
      return `The result is ${result}. Let me know if you need help with anything else!`;
    } catch (error) {
      console.error('Math expression error:', error);
    }
  }

  try {
    console.log('Sending request to search-web function:', currentMessage);
    const { data, error } = await supabase.functions.invoke('search-web', {
      body: { 
        messages: messages.slice(-10), // Send last 10 messages for context
        currentMessage 
      }
    });

    if (error) {
      console.error('Error calling search-web function:', error);
      throw error;
    }

    if (data.response) {
      console.log('Received AI response:', data.response);
      return data.response;
    }

    return "I apologize, but I'm having trouble processing your request right now. Could you try asking again?";
  } catch (error) {
    console.error('Error generating AI response:', error);
    return "I apologize, but I'm having trouble connecting right now. Please try again in a moment.";
  }
};