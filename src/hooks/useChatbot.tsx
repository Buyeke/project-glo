
import { useState } from 'react';
import { ChatMessage } from '@/types/chatbot';
import { useChatData } from './useChatData';
import { useChatInteractionLogger } from './useChatInteractionLogger';
import { useEnhancedChatMessageProcessor } from './useEnhancedChatMessageProcessor';
import { useConversationMemory } from './useConversationMemory';

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
  const { processMessage: processMessageLogic, isAIProcessing } = useEnhancedChatMessageProcessor(intents, services);
  const { memory, updateMemory, getContextSummary, clearMemory } = useConversationMemory();

  const processMessage = async (userMessage: string, forcedLanguage?: string) => {
    console.log('Processing message with AI enhancement:', userMessage);
    
    const { userMsg, botMsg } = await processMessageLogic(userMessage, messages, forcedLanguage);
    
    // Update conversation memory
    updateMemory(userMsg);
    updateMemory(botMsg, {
      urgency: botMsg.confidence && botMsg.confidence > 0.8 ? 'high' : 'medium',
      emotional_state: 'neutral', // This would be enhanced with sentiment analysis
      language_detected: userMsg.language,
      services_needed: botMsg.matchedService ? [botMsg.matchedService] : []
    });

    setMessages(prev => [...prev, userMsg, botMsg]);

    // Log interaction with enhanced metadata
    logInteraction({
      original_message: userMessage,
      detected_language: userMsg.language || 'english',
      translated_message: undefined,
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
    updateMemory(switchMessage);
  };

  const resetConversation = () => {
    setMessages([
      {
        id: 1,
        text: "Hi! I'm Glo's AI assistant. I'm here to help you navigate our services and find the support you need. How can I assist you today?",
        isBot: true,
      },
    ]);
    clearMemory();
  };

  return {
    messages,
    processMessage,
    currentLanguage,
    switchLanguage,
    resetConversation,
    intents,
    services,
    isLoadingIntents,
    isLoadingServices,
    isAIProcessing,
    conversationMemory: memory,
    getContextSummary,
  };
};
