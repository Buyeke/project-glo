
import { ChatMessage, Intent, Service } from '@/types/chatbot';
import { useAIChatProcessor } from './useAIChatProcessor';
import { useChatMessageProcessor } from './useChatMessageProcessor';
import { useKnowledgeBase } from './useKnowledgeBase';
import { useProactiveFollowups } from './useProactiveFollowups';
import { detectLanguageWithContext } from '@/utils/enhancedLanguageDetection';
import { formatEmergencyContactsForChat } from '@/utils/emergencyDetection';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useEnhancedChatMessageProcessor = (intents: Intent[], services: Service[]) => {
  const { processWithAI, isProcessing: isAIProcessing } = useAIChatProcessor();
  const { processMessage: fallbackProcess } = useChatMessageProcessor(intents, services);
  const { searchKnowledge } = useKnowledgeBase();
  const { autoScheduleFollowUps } = useProactiveFollowups();

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
        // Retry once after 2s for transient failures
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

      let enhancedResponse = aiResult.response;
      
      // Add relevant knowledge if found
      if (knowledgeResults.length > 0 && aiResult.analysis.confidence > 0.7) {
        const relevantKnowledge = knowledgeResults[0];
        if (relevantKnowledge.relevance_score && relevantKnowledge.relevance_score > 0.8) {
          enhancedResponse += `\n\n**Additional Information:**\n${relevantKnowledge.content}`;
        }
      }

      const botMsg: ChatMessage = {
        id: messages.length + 2,
        text: enhancedResponse,
        isBot: true,
        language: detectedLanguage,
        intent: aiResult.analysis.intent,
        confidence: aiResult.analysis.confidence,
        matchedService: aiResult.matchedServices[0]?.id,
      };

      // Add service information
      if (aiResult.matchedServices.length > 0) {
        const service = aiResult.matchedServices[0];
        let serviceInfo = `\n\n${service.title}\n${service.description}`;
        if (service.key_features && Array.isArray(service.key_features)) {
          serviceInfo += `\n\nKey Features:\n${service.key_features.map((f: string) => `• ${f}`).join('\n')}`;
        }
        if (service.contact_phone) serviceInfo += `\n\nCall: ${service.contact_phone}`;
        if (service.contact_url) serviceInfo += `\nMore info: ${service.contact_url}`;
        botMsg.text += serviceInfo;
      }

      // Urgency indicators
      if (aiResult.analysis.urgency === 'critical') {
        botMsg.text = `**URGENT SUPPORT NEEDED**\n\n${botMsg.text}`;
        botMsg.text += formatEmergencyContactsForChat();
      } else if (aiResult.analysis.urgency === 'high') {
        botMsg.text = `**Priority Support**\n\n${botMsg.text}`;
      }

      if (aiResult.analysis.requires_human) {
        botMsg.text += `\n\n**A human counselor will be notified to provide additional support.**`;
      }

      // Append emergency contacts for safety concerns
      if (aiResult.analysis.safety_concerns && aiResult.analysis.urgency !== 'critical') {
        botMsg.text += formatEmergencyContactsForChat();
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
      
      // Fallback with knowledge context
      return await fallbackProcess(userMessage, messages, forcedLanguage, knowledgeContext);
    }
  };

  return { 
    processMessage,
    isAIProcessing 
  };
};
