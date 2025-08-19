import { useState, useCallback } from 'react';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  quickReplies?: string[];
}

export const useChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const addMessage = useCallback((message: Message) => {
    setMessages(prevMessages => [...prevMessages, message]);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      isBot: false,
      timestamp: new Date()
    };

    addMessage(userMessage);
    setIsTyping(true);

    // Simulate bot response delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const botResponse = generateBotResponse(text);
    const quickReplies = generateQuickReply(text);

    const botMessage: Message = {
      id: Date.now().toString(),
      text: botResponse,
      isBot: true,
      timestamp: new Date(),
      quickReplies: quickReplies
    };

    addMessage(botMessage);
    setIsTyping(false);
  }, [addMessage]);

  const generateQuickReply = (message: string): string[] => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('help')) {
      return [
        "Tell me about your services",
        "I need emergency help",
        "How do I access resources?",
        "I want to learn more about Glo"
      ];
    }
    
    if (lowerMessage.includes('emergency') || lowerMessage.includes('crisis') || lowerMessage.includes('danger')) {
      return [
        "Call emergency services: 999",
        "Contact crisis helpline: +254 722 178 177",
        "I need immediate safety planning",
        "Connect me to local support"
      ];
    }
    
    if (lowerMessage.includes('housing') || lowerMessage.includes('shelter')) {
      return [
        "Emergency housing options",
        "Temporary accommodation",
        "Long-term housing support",
        "Housing assistance programs"
      ];
    }
    
    if (lowerMessage.includes('job') || lowerMessage.includes('work') || lowerMessage.includes('employment')) {
      return [
        "Job training programs",
        "Employment support services",
        "Skills development",
        "Career counseling"
      ];
    }
    
    return [
      "Tell me more",
      "How can I access this?",
      "What are my options?",
      "I need different help"
    ];
  };

  const generateBotResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('services')) {
      return "We offer trauma-informed care, community connection, and 24/7 AI support.";
    }

    if (lowerMessage.includes('emergency') || lowerMessage.includes('crisis')) {
      return "If you're in immediate danger, please call 999 or contact the crisis helpline at +254 722 178 177.";
    }

    if (lowerMessage.includes('resources')) {
      return "You can browse our resources on the resources page.";
    }

    if (lowerMessage.includes('glo')) {
      return "Project Glo connects homeless women and children in Kenya to trauma-informed care and support services through inclusive, ethical AI technology.";
    }

    if (lowerMessage.includes('housing') || lowerMessage.includes('shelter')) {
      return "We can help you find emergency housing options, temporary accommodation, and long-term housing support.";
    }

    if (lowerMessage.includes('job') || lowerMessage.includes('work') || lowerMessage.includes('employment')) {
      return "We offer job training programs, employment support services, skills development, and career counseling.";
    }

    return "I'm here to help. How can I assist you today?";
  };

  const getWelcomeMessage = () => {
    return {
      id: Date.now().toString(),
      text: "Hello! I'm Glo, your AI assistant. I'm here to help connect you with trauma-informed care and support services. How can I assist you today?",
      isBot: true,
      timestamp: new Date(),
      quickReplies: [
        "I need help with housing",
        "I'm looking for job support", 
        "I need healthcare services",
        "Tell me about safety resources"
      ]
    };
  };

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isTyping,
    sendMessage,
    addMessage,
    getWelcomeMessage,
    clearChat
  };
};
