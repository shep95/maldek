import { Message } from "../types/messageTypes";
import { supabase } from "@/integrations/supabase/client";

interface ConversationContext {
  messages: Message[];
  currentMessage: string;
}

export const generateAIResponse = async (context: ConversationContext): Promise<string> => {
  const { messages, currentMessage } = context;
  const message = currentMessage.toLowerCase();
  
  // Handle mathematical expressions
  if (message.match(/[0-9+\-*/()]/)) {
    try {
      const sanitizedExpression = message.replace(/[^0-9+\-*/().]/g, '');
      const result = Function('"use strict";return (' + sanitizedExpression + ')')();
      return `It's ${result}! Let me know if you need help with any other calculations.`;
    } catch (error) {
      return "Hmm, that math expression is a bit tricky. Could you write it differently? For example, use '2 + 2' format.";
    }
  }

  try {
    console.log('Sending request to search-web function:', currentMessage);
    const { data, error } = await supabase.functions.invoke('search-web', {
      body: { query: currentMessage }
    });

    if (error) {
      console.error('Error calling search-web function:', error);
      throw error;
    }

    if (data.response) {
      console.log('Received AI response:', data.response);
      return data.response;
    }

    // Fallback responses if the search-web function fails
    if (message.includes('hello') || message.includes('hi ') || message.includes('hey')) {
      return "Hey there! How can I help you today?";
    }

    if (message.includes('thank')) {
      return "You're welcome! Always happy to help. What else would you like to know?";
    }

    return "I'm not quite sure how to respond to that. Could you try rephrasing your question?";
  } catch (error) {
    console.error('Error generating AI response:', error);
    return "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.";
  }
};