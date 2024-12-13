import { Message } from "../types/messageTypes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ConversationContext {
  messages: Message[];
  currentMessage: string;
  imageUrl?: string;
  generateImage?: boolean;
}

export const generateAIResponse = async (context: ConversationContext): Promise<string | { text: string; imageUrl: string }> => {
  const { messages, currentMessage, imageUrl, generateImage } = context;
  
  try {
    console.log('Sending request to OpenAI via Edge Function:', { 
      messageCount: messages.length,
      currentMessage,
      hasImage: !!imageUrl,
      generateImage 
    });

    const { data, error } = await supabase.functions.invoke('search-web', {
      body: { 
        messages: messages.slice(-10),
        currentMessage,
        imageUrl,
        generateImage
      }
    });

    if (error) {
      console.error('Error calling search-web function:', error);
      throw error;
    }

    if (data.response) {
      console.log('Received OpenAI response:', {
        responseLength: data.response.length,
        firstFewWords: data.response.slice(0, 50),
        hasGeneratedImage: !!data.generatedImageUrl
      });
      
      if (data.generatedImageUrl) {
        return {
          text: data.response,
          imageUrl: data.generatedImageUrl
        };
      }
      
      return data.response;
    }

    console.error('No response received from OpenAI');
    throw new Error("No response received from AI");
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
};