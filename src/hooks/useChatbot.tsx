
import { useState } from 'react';
import { ChatMessage } from '@/types/chatbot';
import { useChatData } from './useChatData';
import { useChatInteractionLogger } from './useChatInteractionLogger';
import { useChatMessageProcessor } from './useChatMessageProcessor';

export const useChatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: "Hi! I'm Glo's AI assistant. I'm here to help you navigate our services and find the support you need. We've helped 50+ women and 100+ children through our network of 10+ shelter partners. How can I assist you today?",
      isBot: true,
    },
  ]);
  const [currentLanguage, setCurrentLanguage] = useState('english');

  const { intents, services, isLoadingIntents, isLoadingServices } = useChatData();
  const { logInteraction } = useChatInteractionLogger();
  const { processMessage: processMessageLogic } = useChatMessageProcessor(intents, services);

  const processMessage = async (userMessage: string, forcedLanguage?: string) => {
    const { userMsg, botMsg } = await processMessageLogic(userMessage, messages, forcedLanguage);
    setMessages(prev => [...prev, userMsg, botMsg]);

    // Log interaction (always log, even for fallback responses)
    logInteraction({
      original_message: userMessage,
      detected_language: userMsg.language || 'english',
      translated_message: undefined, // This would be set by processMessageLogic if needed
      matched_intent: botMsg.intent,
      matched_service: botMsg.matchedService,
      response: botMsg.text,
      translated_response: botMsg.translatedFrom ? botMsg.text : undefined,
      confidence_score: botMsg.confidence,
    });

    return botMsg;
  };

  const switchLanguage = (language: string) => {
    setCurrentLanguage(language);
    
    // Add a language switch message
    const switchMessage: ChatMessage = {
      id: messages.length + 1,
      text: `Language switched to ${language}. How can I help you?`,
      isBot: true,
      language,
    };
    
    setMessages(prev => [...prev, switchMessage]);
  };

  return {
    messages,
    processMessage,
    currentLanguage,
    switchLanguage,
    intents,
    services,
    isLoadingIntents,
    isLoadingServices,
  };
};
