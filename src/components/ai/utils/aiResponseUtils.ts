import { Message } from "../types/messageTypes";
import { supabase } from "@/integrations/supabase/client";

interface ConversationContext {
  messages: Message[];
  currentMessage: string;
}

export const generateAIResponse = async (context: ConversationContext): Promise<string> => {
  const { messages, currentMessage } = context;
  const message = currentMessage.toLowerCase();
  
  // Get the last few messages for context
  const recentMessages = messages.slice(-3);
  const hasRecentContext = recentMessages.length > 0;
  
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

  // Check if this is a knowledge-based question that might benefit from web search
  const isKnowledgeQuestion = message.startsWith('what') || 
                            message.startsWith('who') || 
                            message.startsWith('how') || 
                            message.startsWith('why') ||
                            message.startsWith('when') ||
                            message.includes('tell me about') ||
                            message.includes('explain');

  if (isKnowledgeQuestion) {
    try {
      const { data, error } = await supabase.functions.invoke('search-web', {
        body: { query: currentMessage }
      });

      if (error) throw error;

      if (data.response) {
        return data.response;
      }
    } catch (error) {
      console.error('Error searching web:', error);
      // Fall back to regular response if web search fails
    }
  }

  // Check if this is a follow-up question
  const isFollowUp = hasRecentContext && (
    message.includes('what about') ||
    message.includes('and then') ||
    message.includes('why') ||
    message.startsWith('how about') ||
    message.startsWith('what if')
  );

  if (isFollowUp) {
    const lastAssistantMessage = messages
      .filter(m => m.role === 'assistant')
      .slice(-1)[0];

    if (lastAssistantMessage && lastAssistantMessage.content.includes('relationship')) {
      return "I remember we were talking about relationships. Based on that, I think what you're asking about now relates to that topic. Could you tell me more about your specific situation?";
    }
    if (lastAssistantMessage && lastAssistantMessage.content.includes('career')) {
      return "Following up on our career discussion - this is an important aspect to consider. What specific concerns do you have about this?";
    }
  }

  // Handle personal advice requests with context
  if (message.includes('advice') || message.includes('help me with') || message.includes('what should i do')) {
    if (message.includes('relationship') || message.includes('dating') || message.includes('partner')) {
      return "Relationships can be complex! Communication and respect are key. Want to tell me more about what's going on? I might be able to offer some perspective.";
    }
    if (message.includes('career') || message.includes('job') || message.includes('work')) {
      return "Career decisions are always big ones. What's most important to you right now - growth, stability, or trying something new? Let's talk about your goals.";
    }
    if (message.includes('stress') || message.includes('anxiety') || message.includes('worried')) {
      return "I hear you - stress can be really tough to deal with. Taking deep breaths helps, and so does talking about it. What's on your mind?";
    }
  }

  // Handle greetings with context
  if (message.includes('hello') || message.includes('hi ') || message.includes('hey')) {
    if (hasRecentContext) {
      return "Hey again! Still here to help. What's on your mind?";
    }
    return "Hey there! How's your day going? I'm here if you need help with anything - math, advice, you name it!";
  }

  // Handle thank you messages with context
  if (message.includes('thank')) {
    if (hasRecentContext) {
      return "You're welcome! I'm glad I could help with that. What else would you like to explore?";
    }
    return "You're welcome! Always happy to help. What else is on your mind?";
  }

  // Handle general help requests
  if (message.includes('help') || message.includes('what can you do')) {
    return `I can help with lots of things! Need quick math? Just type something like "25 * 4". 
Want advice about work or relationships? I'm all ears. 
Or if you're just looking to chat or need someone to bounce ideas off of, I'm here for that too!`;
  }

  // Handle general knowledge questions with context
  if (message.startsWith('what is') || message.startsWith('who is') || message.startsWith('how do') || message.startsWith('why')) {
    const subject = message.replace(/^(what|who|how|why)\s+(is|are|do|does)\s+/i, '');
    if (hasRecentContext) {
      return `Building on our conversation, you're asking about ${subject}. What specific aspects would you like to explore?`;
    }
    return "That's an interesting question about " + subject + ". Tell me more about what you'd like to know, and I'll share what I know!";
  }

  // Default response with context
  if (hasRecentContext) {
    return "I see how this relates to what we were discussing. Could you elaborate a bit more? I want to make sure I understand exactly what you're asking.";
  }
  return "Hey! I'm interested in hearing more about that. Could you tell me a bit more? I'm pretty good with math, advice, and general questions!";
};