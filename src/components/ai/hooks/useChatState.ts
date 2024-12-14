import { useState, useEffect } from "react";
import { Message } from "../types/messageTypes";

export const useChatState = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "👋 Hi! I'm Bosley AI, your AI assistant. I can help you generate images and answer questions. Try saying 'Generate an image of...' or ask me anything!",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  return {
    messages,
    setMessages,
    isLoading,
    setIsLoading
  };
};