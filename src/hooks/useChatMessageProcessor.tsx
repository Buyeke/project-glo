
import { detectLanguage } from '@/utils/languageUtils';
import { matchIntent, getFallbackResponse, translateText, matchService } from '@/utils/intentMatcher';
import { ChatMessage, Intent, Service } from '@/types/chatbot';

export const useChatMessageProcessor = (intents: Intent[], services: Service[]) => {
  const processMessage = async (
    userMessage: string, 
    messages: ChatMessage[], 
    forcedLanguage?: string
  ): Promise<{ userMsg: ChatMessage; botMsg: ChatMessage }> => {
    console.log('Processing message:', userMessage);
    
    const detectedLanguage = forcedLanguage || detectLanguage(userMessage);
    console.log('Detected language:', detectedLanguage);

    // Translate to English for intent matching if needed
    let messageForMatching = userMessage;
    if (detectedLanguage !== 'english') {
      try {
        messageForMatching = await translateText(userMessage, detectedLanguage, 'english');
        console.log('Translated message for matching:', messageForMatching);
      } catch (error) {
        console.error('Translation failed:', error);
        // Continue with original message if translation fails
      }
    }

    // First try to match intents
    console.log('Starting intent matching with', intents.length, 'intents');
    const { intent, confidence } = matchIntent(messageForMatching, intents, 'english');
    console.log('Intent matching result:', {
      intent: intent?.intent_key,
      confidence,
      hasIntent: !!intent
    });

    // Then try to match services
    console.log('Starting service matching with', services.length, 'services');
    const matchedServices = matchService(messageForMatching, services);
    console.log('Service matching result:', matchedServices);

    let response: string;
    let matchedIntent: string | undefined;
    let matchedServiceId: string | undefined;

    if (matchedServices.length > 0) {
      // Format service response
      const service = matchedServices[0];
      matchedServiceId = service.id;
      
      const features = Array.isArray(service.key_features) 
        ? service.key_features.map(feature => `• ${feature}`).join('\n')
        : '• Professional support available';

      response = `🔹 ${service.title}\n${service.description}\n\nKey Features:\n${features}`;
      
      if (service.contact_phone) {
        response += `\n\n📞 Call: ${service.contact_phone}`;
      }
      
      if (service.contact_url) {
        response += `\n🌐 More info: ${service.contact_url}`;
      }

      console.log('Using service response for:', service.title);
    } else if (intent && confidence > 0) {
      // Get response in detected language from intent
      response = intent.response_template[detectedLanguage] || 
                intent.response_template['english'] || 
                getFallbackResponse(detectedLanguage);
      matchedIntent = intent.intent_key;
      console.log('Using matched intent response:', response);
    } else {
      response = getFallbackResponse(detectedLanguage);
      console.log('Using fallback response:', response);
    }

    // Add translation note if language was detected as non-English
    let finalResponse = response;
    let translatedFrom: string | undefined;
    
    if (detectedLanguage !== 'english') {
      translatedFrom = detectedLanguage;
      finalResponse = `${response}\n\n_Translated from ${detectedLanguage}_`;
    }

    // Create messages
    const userMsg: ChatMessage = {
      id: messages.length + 1,
      text: userMessage,
      isBot: false,
      language: detectedLanguage,
    };

    const botMsg: ChatMessage = {
      id: messages.length + 2,
      text: finalResponse,
      isBot: true,
      language: detectedLanguage,
      translatedFrom,
      intent: matchedIntent,
      confidence,
      matchedService: matchedServiceId,
    };

    return { userMsg, botMsg };
  };

  return { processMessage };
};
