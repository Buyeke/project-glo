
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
      text: "Supa mresh! Mimi ni GLO, rafiki yako wa kweli. Niko hapa kukusaidia na vitu zote - makazi, afya, legal aid, na vitu zingine. Unaweza niongelesha polepole, sina haraka. Unataka msaada gani leo? 🙏🏽💜",
      isBot: true,
      language: 'sheng',
    },
  ]);
  const [currentLanguage, setCurrentLanguage] = useState('sheng');

  const { intents, services, isLoadingIntents, isLoadingServices } = useChatData();
  const { logInteraction } = useChatInteractionLogger();
  const { processMessage: processMessageLogic, isAIProcessing } = useEnhancedChatMessageProcessor(intents, services);
  const { memory, updateMemory, getContextSummary, clearMemory } = useConversationMemory();

  const processMessage = async (userMessage: string, forcedLanguage?: string) => {
    console.log('Processing message with trauma-informed AI:', userMessage);
    
    const { userMsg, botMsg } = await processMessageLogic(userMessage, messages, forcedLanguage);
    
    // Update conversation memory with trauma-informed context
    updateMemory(userMsg);
    updateMemory(botMsg, {
      urgency: botMsg.confidence && botMsg.confidence > 0.8 ? 'high' : 'medium',
      emotional_state: 'caring', // Always maintain caring tone
      language_detected: userMsg.language,
      services_needed: botMsg.matchedService ? [botMsg.matchedService] : []
    });

    setMessages(prev => [...prev, userMsg, botMsg]);

    // Log interaction with trauma-informed metadata
    logInteraction({
      original_message: userMessage,
      detected_language: userMsg.language || 'sheng',
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
    
    // Add a trauma-informed language switch message
    const switchMessages = {
      sheng: "Poa mresh! Sasa tutaongea kwa Sheng. Ni nini unaweza nisaidie?",
      swahili: "Sawa rafiki! Sasa tutaongea kwa Kiswahili. Unaweza niambie unavyohitaji msaada?",
      english: "That's fine! Now we'll speak in English. How can I help you today?",
      arabic: "حسناً! الآن سنتحدث بالعربية. كيف يمكنني مساعدتك اليوم؟"
    };
    
    const switchMessage: ChatMessage = {
      id: messages.length + 1,
      text: switchMessages[language as keyof typeof switchMessages] || switchMessages.sheng,
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
        text: "Supa mresh! Mimi ni GLO, rafiki yako wa kweli. Niko hapa kukusaidia na vitu zote - makazi, afya, legal aid, na vitu zingine. Unaweza niongelesha polepole, sina haraka. Unataka msaada gani leo? 🙏🏽💜",
        isBot: true,
        language: 'sheng',
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
