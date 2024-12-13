export const generateAIResponse = (userMessage: string): string => {
  // Convert message to lowercase for easier matching
  const message = userMessage.toLowerCase();
  
  // Handle mathematical expressions
  if (message.match(/[0-9+\-*/()]/)) {
    try {
      const sanitizedExpression = message.replace(/[^0-9+\-*/().]/g, '');
      const result = Function('"use strict";return (' + sanitizedExpression + ')')();
      return `The result of ${sanitizedExpression} is ${result}`;
    } catch (error) {
      return "I couldn't process that mathematical expression. Please make sure it's properly formatted.";
    }
  }

  // Handle personal advice requests
  if (message.includes('advice') || message.includes('help me with') || message.includes('what should i do')) {
    if (message.includes('relationship') || message.includes('dating') || message.includes('partner')) {
      return "For relationship matters, it's important to maintain open communication and respect boundaries. Consider discussing your feelings openly with your partner. Would you like to share more specific details about your situation?";
    }
    if (message.includes('career') || message.includes('job') || message.includes('work')) {
      return "Career decisions should align with your values and long-term goals. Consider making a list of your priorities and skills. What specific aspects of your career are you thinking about?";
    }
    if (message.includes('stress') || message.includes('anxiety') || message.includes('worried')) {
      return "It's normal to feel stressed sometimes. Try practicing deep breathing, maintaining a routine, and taking breaks. For persistent concerns, consider speaking with a mental health professional. Would you like to discuss what's causing your stress?";
    }
  }

  // Handle greetings
  if (message.includes('hello') || message.includes('hi ') || message.includes('hey')) {
    return "Hello! I'm Daarp, your AI assistant. How can I help you today?";
  }

  // Handle thank you messages
  if (message.includes('thank')) {
    return "You're welcome! I'm here to help. Is there anything else you'd like to know?";
  }

  // Handle general help requests
  if (message.includes('help') || message.includes('what can you do')) {
    return `I can help you with various tasks including:
- Mathematical calculations (try "what is 25 * 4?")
- Personal advice and guidance
- General knowledge questions
- Problem-solving
- Analysis and explanations
- Creative suggestions

What would you like help with?`;
  }

  // Handle general knowledge questions
  if (message.startsWith('what is') || message.startsWith('who is') || message.startsWith('how do') || message.startsWith('why')) {
    return "I understand you're asking about " + message.replace(/^(what|who|how|why)\s+(is|are|do|does)\s+/i, '') + ". Could you provide more specific details about what you'd like to know? I'll do my best to help you understand this topic.";
  }

  // Default response for other queries
  return "I understand your question. I'm here to help with calculations, advice, or any other questions you might have. Could you please provide more details about what you'd like to know?";
};