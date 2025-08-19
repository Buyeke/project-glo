
import { useState, useCallback } from 'react';
import { useChatData } from './useChatData';
import { useEnhancedChatMessageProcessor } from './useEnhancedChatMessageProcessor';
import { ChatMessage } from '@/types/chatbot';

export const useChatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState('sheng');
  const [isTyping, setIsTyping] = useState(false);
  
  const { intents, services, isLoadingIntents } = useChatData();
  const { processMessage: enhancedProcessMessage, isAIProcessing } = useEnhancedChatMessageProcessor(intents, services);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prevMessages => [...prevMessages, message]);
  }, []);

  const processMessage = useCallback(async (text: string, language?: string) => {
    if (!text.trim() || isAIProcessing) return;

    const currentLang = language || currentLanguage;
    setIsTyping(true);

    try {
      const { userMsg, botMsg } = await enhancedProcessMessage(text, messages, currentLang);
      
      addMessage(userMsg);
      
      // Simulate typing delay for bot response
      setTimeout(() => {
        addMessage(botMsg);
        setIsTyping(false);
      }, 500);
    } catch (error) {
      console.error('Error processing message:', error);
      setIsTyping(false);
    }
  }, [messages, currentLanguage, enhancedProcessMessage, isAIProcessing, addMessage]);

  const sendMessage = useCallback(async (text: string) => {
    await processMessage(text);
  }, [processMessage]);

  const switchLanguage = useCallback((language: string) => {
    setCurrentLanguage(language);
  }, []);

  const getWelcomeMessage = useCallback((): ChatMessage => {
    return {
      id: 1,
      text: "Hello! I'm Glo, your AI assistant. I'm here to help connect you with trauma-informed care and support services. How can I assist you today?",
      isBot: true,
      language: currentLanguage,
    };
  }, [currentLanguage]);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isTyping,
    currentLanguage,
    processMessage,
    sendMessage,
    addMessage,
    switchLanguage,
    getWelcomeMessage,
    clearChat,
    isLoadingIntents,
    isAIProcessing
  };
};
