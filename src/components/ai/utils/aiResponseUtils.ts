export const generateAIResponse = (userMessage: string): string => {
  // Convert message to lowercase for easier matching
  const message = userMessage.toLowerCase();
  
  // Check if it's a math expression
  if (message.match(/[0-9+\-*/()]/)) {
    try {
      // Safely evaluate mathematical expressions
      const sanitizedExpression = message.replace(/[^0-9+\-*/().]/g, '');
      const result = Function('"use strict";return (' + sanitizedExpression + ')')();
      return `The result of ${sanitizedExpression} is ${result}`;
    } catch (error) {
      return "I couldn't process that mathematical expression. Please make sure it's properly formatted.";
    }
  }

  // Handle greetings
  if (message.includes('hello') || message.includes('hi ')) {
    return "Hello! How can I assist you today?";
  }

  // Handle help requests
  if (message.includes('help')) {
    return `I can help you with various tasks including:
- Mathematical calculations (try "what is 25 * 4?")
- General questions
- Analysis and explanations
- Creative suggestions
What would you like help with?`;
  }

  // Handle thank you messages
  if (message.includes('thank')) {
    return "You're welcome! Is there anything else I can help you with?";
  }

  // Default response for other queries
  return "I understand your question. Let me help you with that. Could you please provide more details about what you'd like to know?";
};