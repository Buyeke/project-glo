
import { ChatMessage, Intent, Service } from '@/types/chatbot';
import { useAIChatProcessor } from './useAIChatProcessor';
import { useChatMessageProcessor } from './useChatMessageProcessor';
import { detectLanguageWithContext } from '@/utils/enhancedLanguageDetection';

export const useEnhancedChatMessageProcessor = (intents: Intent[], services: Service[]) => {
  const { processWithAI, isProcessing: isAIProcessing } = useAIChatProcessor();
  const { processMessage: fallbackProcess } = useChatMessageProcessor(intents, services);

  const processMessage = async (
    userMessage: string, 
    messages: ChatMessage[], 
    forcedLanguage?: string
  ): Promise<{ userMsg: ChatMessage; botMsg: ChatMessage }> => {
    console.log('Enhanced processing started for:', userMessage);
    
    const detection = detectLanguageWithContext(userMessage);
    const detectedLanguage = forcedLanguage || detection.language;

    // Create user message
    const userMsg: ChatMessage = {
      id: messages.length + 1,
      text: userMessage,
      isBot: false,
      language: detectedLanguage,
    };

    try {
      // Try AI processing first
      const aiResult = await new Promise<any>((resolve, reject) => {
        processWithAI({
          message: userMessage,
          conversationHistory: messages,
          language: detectedLanguage
        }, {
          onSuccess: resolve,
          onError: reject
        });
      });

      console.log('AI processing successful:', aiResult);

      // Create enhanced bot message with AI response
      const botMsg: ChatMessage = {
        id: messages.length + 2,
        text: aiResult.response,
        isBot: true,
        language: detectedLanguage,
        intent: aiResult.analysis.intent,
        confidence: aiResult.analysis.confidence,
        matchedService: aiResult.matchedServices[0]?.id,
      };

      // Add service information if services were matched
      if (aiResult.matchedServices.length > 0) {
        const service = aiResult.matchedServices[0];
        let serviceInfo = `\n\n🔹 ${service.title}\n${service.description}`;
        
        if (service.key_features && Array.isArray(service.key_features)) {
          const features = service.key_features.map(feature => `• ${feature}`).join('\n');
          serviceInfo += `\n\nKey Features:\n${features}`;
        }
        
        if (service.contact_phone) {
          serviceInfo += `\n\n📞 Call: ${service.contact_phone}`;
        }
        
        if (service.contact_url) {
          serviceInfo += `\n🌐 More info: ${service.contact_url}`;
        }

        botMsg.text += serviceInfo;
      }

      // Add urgent response indicator
      if (aiResult.analysis.urgency === 'critical') {
        botMsg.text = `🚨 **URGENT SUPPORT NEEDED** 🚨\n\n${botMsg.text}`;
      } else if (aiResult.analysis.urgency === 'high') {
        botMsg.text = `⚠️ **Priority Support** ⚠️\n\n${botMsg.text}`;
      }

      // Add human escalation if needed
      if (aiResult.analysis.requires_human) {
        botMsg.text += `\n\n👥 **A human counselor will be notified to provide additional support.**`;
      }

      return { userMsg, botMsg };

    } catch (error) {
      console.error('AI processing failed, using fallback:', error);
      
      // Fallback to original processing
      return await fallbackProcess(userMessage, messages, forcedLanguage);
    }
  };

  return { 
    processMessage,
    isAIProcessing 
  };
};
