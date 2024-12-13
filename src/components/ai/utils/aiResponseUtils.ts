export const generateAIResponse = (userMessage: string): string => {
  // Convert message to lowercase for easier matching
  const message = userMessage.toLowerCase();
  
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

  // Handle personal advice requests
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

  // Handle greetings
  if (message.includes('hello') || message.includes('hi ') || message.includes('hey')) {
    return "Hey there! How's your day going? I'm here if you need help with anything - math, advice, you name it!";
  }

  // Handle thank you messages
  if (message.includes('thank')) {
    return "You're welcome! Always happy to help. What else is on your mind?";
  }

  // Handle general help requests
  if (message.includes('help') || message.includes('what can you do')) {
    return `I can help with lots of things! Need quick math? Just type something like "25 * 4". 
Want advice about work or relationships? I'm all ears. 
Or if you're just looking to chat or need someone to bounce ideas off of, I'm here for that too!`;
  }

  // Handle general knowledge questions
  if (message.startsWith('what is') || message.startsWith('who is') || message.startsWith('how do') || message.startsWith('why')) {
    return "That's an interesting question about " + message.replace(/^(what|who|how|why)\s+(is|are|do|does)\s+/i, '') + ". Tell me more about what you'd like to know, and I'll share what I know!";
  }

  // Default response for other queries
  return "Hey! I'm interested in hearing more about that. Could you tell me a bit more? I'm pretty good with math, advice, and general questions!";
};