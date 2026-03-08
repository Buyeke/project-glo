
import { ChatMessage, Intent, Service } from '@/types/chatbot';
import { useAIChatProcessor } from './useAIChatProcessor';
import { useChatMessageProcessor } from './useChatMessageProcessor';
import { useKnowledgeBase } from './useKnowledgeBase';
import { useProactiveFollowups } from './useProactiveFollowups';
import { useServiceMatching } from './useServiceMatching';
import { detectLanguageWithContext } from '@/utils/enhancedLanguageDetection';
import { formatEmergencyContactsForChat } from '@/utils/emergencyDetection';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useEnhancedChatMessageProcessor = (intents: Intent[], services: Service[]) => {
  const { processWithAI, isProcessing: isAIProcessing } = useAIChatProcessor();
  const { processMessage: fallbackProcess } = useChatMessageProcessor(intents, services);
  const { searchKnowledge } = useKnowledgeBase();
  const { autoScheduleFollowUps } = useProactiveFollowups();
  const { matchFromIntent } = useServiceMatching();

  const processMessage = async (
    userMessage: string, 
    messages: ChatMessage[], 
    forcedLanguage?: string
  ): Promise<{ userMsg: ChatMessage; botMsg: ChatMessage }> => {
    console.log('Enhanced processing with RAG started for:', userMessage);
    
    const detection = detectLanguageWithContext(userMessage);
    const detectedLanguage = forcedLanguage || detection.language;

    const userMsg: ChatMessage = {
      id: messages.length + 1,
      text: userMessage,
      isBot: false,
      language: detectedLanguage,
    };

    // Fetch knowledge base results (used by both AI and fallback paths)
    let knowledgeResults: any[] = [];
    let knowledgeContext = '';
    try {
      knowledgeResults = await searchKnowledge(userMessage, 3);
      knowledgeContext = knowledgeResults.map(item => 
        `Title: ${item.title}\nContent: ${item.content}\nCategory: ${item.category}`
      ).join('\n\n');
    } catch (err) {
      console.error('Knowledge search failed:', err);
    }

    // Try AI processing with retry
    const tryAICall = () => new Promise<any>((resolve, reject) => {
      processWithAI({
        message: userMessage,
        conversationHistory: messages,
        language: detectedLanguage,
        knowledgeContext,
      }, {
        onSuccess: resolve,
        onError: reject,
      });
    });

    try {
      let aiResult: any;
      try {
        aiResult = await tryAICall();
      } catch (firstError: any) {
        const isTransient = firstError?.message?.includes('503') || 
                           firstError?.message?.includes('timeout') ||
                           firstError?.message?.includes('gateway error');
        if (isTransient) {
          console.log('Transient AI failure, retrying in 2s...');
          await delay(2000);
          aiResult = await tryAICall();
        } else {
          throw firstError;
        }
      }

      console.log('AI processing with RAG successful:', aiResult);

      // Use the AI response as-is — no bold headers, no emoji decoration
      const botMsg: ChatMessage = {
        id: messages.length + 2,
        text: aiResult.response,
        isBot: true,
        language: detectedLanguage,
        intent: aiResult.analysis.intent,
        confidence: aiResult.analysis.confidence,
        matchedService: aiResult.matchedServices[0]?.id,
      };

      // Append matched service contact info (plain text, no formatting)
      if (aiResult.matchedServices.length > 0) {
        const service = aiResult.matchedServices[0];
        let serviceInfo = `\n\n${service.title}`;
        if (service.contact_phone) serviceInfo += `\nCall: ${service.contact_phone}`;
        if (service.contact_url) serviceInfo += `\nMore info: ${service.contact_url}`;
        botMsg.text += serviceInfo;
      }

      // Append provider contacts (plain text, no emojis or bold)
      try {
        const intentCategory = aiResult.analysis.intent || '';
        const providerMatch = matchFromIntent(intentCategory, aiResult.analysis.urgency);
        
        if (providerMatch.providers.length > 0) {
          botMsg.text += `\n\nRelevant organizations:`;
          providerMatch.providers.slice(0, 2).forEach(match => {
            botMsg.text += `\n\n${match.provider.provider_name}`;
            if (match.provider.contact_info?.phone) {
              botMsg.text += ` - ${match.provider.contact_info.phone}`;
            }
            if (match.provider.location_data?.address) {
              botMsg.text += ` (${match.provider.location_data.address})`;
            }
          });
        }
      } catch (matchError) {
        console.error('Provider matching failed:', matchError);
      }

      // Append emergency contacts only for critical/safety situations
      if (aiResult.analysis.urgency === 'critical' || aiResult.analysis.safety_concerns) {
        botMsg.text += formatEmergencyContactsForChat();
      }

      if (aiResult.analysis.requires_human) {
        botMsg.text += `\n\nA counselor will be notified to follow up with you.`;
      }

      // Schedule follow-ups
      try {
        await autoScheduleFollowUps({
          urgency: aiResult.analysis.urgency,
          emotional_state: aiResult.analysis.emotional_state,
          matched_services: aiResult.matchedServices,
          requires_human: aiResult.analysis.requires_human,
          language: detectedLanguage,
        });
      } catch (error) {
        console.error('Error scheduling follow-ups:', error);
      }

      return { userMsg, botMsg };

    } catch (error) {
      console.error('AI processing failed after retry, using fallback with knowledge:', error);
      return await fallbackProcess(userMessage, messages, forcedLanguage, knowledgeContext);
    }
  };

  return { 
    processMessage,
    isAIProcessing 
  };
};
