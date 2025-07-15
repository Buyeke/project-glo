
import { detectLanguage, getContextualGreeting, getCulturalResponse, detectEmotionalState } from '@/utils/languageUtils';
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
    const emotionalState = detectEmotionalState(userMessage, detectedLanguage);
    
    console.log('Detected language:', detectedLanguage);
    console.log('Emotional state:', emotionalState);

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

    // First try to match intents with enhanced cultural context
    console.log('Starting intent matching with', intents.length, 'intents');
    const { intent, confidence } = matchIntent(messageForMatching, intents, detectedLanguage);
    console.log('Intent matching result:', {
      intent: intent?.intent_key,
      confidence,
      hasIntent: !!intent
    });

    // Then try to match services with cultural awareness
    console.log('Starting service matching with', services.length, 'services');
    const matchedServices = matchService(userMessage, services);
    console.log('Service matching result:', matchedServices);

    let response: string;
    let matchedIntent: string | undefined;
    let matchedServiceId: string | undefined;

    if (matchedServices.length > 0) {
      // Format service response with cultural context
      const service = matchedServices[0];
      matchedServiceId = service.id;
      
      const features = Array.isArray(service.key_features) 
        ? service.key_features.map(feature => `• ${feature}`).join('\n')
        : '• Professional support available';

      // Culturally appropriate service response
      const serviceIntro = getServiceResponseIntro(detectedLanguage, emotionalState);
      response = `${serviceIntro}\n\n🔹 ${service.title}\n${service.description}\n\nKey Features:\n${features}`;
      
      if (service.contact_phone) {
        const callText = detectedLanguage === 'swahili' ? 'Piga simu' : 
                        detectedLanguage === 'sheng' ? 'Call' : 'Call';
        response += `\n\n📞 ${callText}: ${service.contact_phone}`;
      }
      
      if (service.contact_url) {
        const moreInfoText = detectedLanguage === 'swahili' ? 'Maelezo zaidi' :
                            detectedLanguage === 'sheng' ? 'More info' : 'More info';
        response += `\n🌐 ${moreInfoText}: ${service.contact_url}`;
      }

      // Add encouraging note based on emotional state
      if (emotionalState === 'distressed') {
        response += getEncouragementNote(detectedLanguage);
      }

      console.log('Using service response for:', service.title);
    } else if (intent && confidence > 0) {
      // Get culturally appropriate response from intent
      let baseResponse = intent.response_template[detectedLanguage] || 
                        intent.response_template['english'] || 
                        getFallbackResponse(detectedLanguage);
      
      // Enhance response based on emotional state
      response = enhanceResponseWithEmotion(baseResponse, emotionalState, detectedLanguage);
      matchedIntent = intent.intent_key;
      console.log('Using matched intent response:', response);
    } else {
      // Enhanced fallback with cultural greeting
      const greeting = getContextualGreeting(detectedLanguage);
      const helpResponse = getCulturalResponse('help', detectedLanguage);
      response = `${greeting}\n\n${helpResponse}`;
      console.log('Using culturally enhanced fallback response:', response);
    }

    // Add cultural sign-off if appropriate
    if (emotionalState === 'grateful') {
      const gratefulResponse = getCulturalResponse('thanks', detectedLanguage);
      response += `\n\n${gratefulResponse}`;
    }

    // Create messages with enhanced metadata
    const userMsg: ChatMessage = {
      id: messages.length + 1,
      text: userMessage,
      isBot: false,
      language: detectedLanguage,
    };

    const botMsg: ChatMessage = {
      id: messages.length + 2,
      text: response,
      isBot: true,
      language: detectedLanguage,
      intent: matchedIntent,
      confidence,
      matchedService: matchedServiceId,
    };

    return { userMsg, botMsg };
  };

  return { processMessage };
};

// Helper function to get service response intro based on language and emotion
const getServiceResponseIntro = (language: string, emotionalState: string): string => {
  const intros = {
    urgent: {
      sheng: "Sawa bro, naona ni emergency. Niko na service ya haraka:",
      swahili: "Naona hii ni dharura. Nina huduma ya haraka:",
      english: "I understand this is urgent. Here's immediate help:",
      arabic: "أفهم أن هذا عاجل. إليك المساعدة الفورية:"
    },
    distressed: {
      sheng: "Pole sana maze. Tutakusaidia. Hii ni service inayoweza kukusaidia:",
      swahili: "Pole sana kwa hali hii. Hii ni huduma inayoweza kukusaidia:",
      english: "I'm sorry you're going through this. Here's a service that can help:",
      arabic: "أنا آسف لما تمرين به. إليك خدمة يمكنها المساعدة:"
    },
    neutral: {
      sheng: "Poa, nimepata service inayofaa kwako:",
      swahili: "Nimepata huduma inayokufaa:",
      english: "I found a service that matches your needs:",
      arabic: "وجدت خدمة تناسب احتياجاتك:"
    }
  };
  
  const stateIntros = intros[emotionalState as keyof typeof intros] || intros.neutral;
  return stateIntros[language as keyof typeof stateIntros] || stateIntros.english;
};

// Helper function to add encouragement based on language
const getEncouragementNote = (language: string): string => {
  const notes = {
    sheng: "\n\n💙 Bro, utapona. Haumo peke yako kwa hii.",
    swahili: "\n\n💙 Tutakusaidia kupita katika hali hii. Haumo peke yako.",
    english: "\n\n💙 You're going to get through this. You're not alone.",
    arabic: "\n\n💙 ستتجاوزين هذا الأمر. لست وحدك."
  };
  
  return notes[language as keyof typeof notes] || notes.english;
};

// Helper function to enhance responses based on emotional state
const enhanceResponseWithEmotion = (baseResponse: string, emotionalState: string, language: string): string => {
  if (emotionalState === 'urgent') {
    const urgentPrefixes = {
      sheng: "Emergency! ",
      swahili: "Dharura! ",
      english: "Emergency! ",
      arabic: "طوارئ! "
    };
    const prefix = urgentPrefixes[language as keyof typeof urgentPrefixes] || urgentPrefixes.english;
    return `${prefix}${baseResponse}`;
  }
  
  if (emotionalState === 'distressed') {
    const comfortPrefixes = {
      sheng: "Pole sana bro. ",
      swahili: "Pole sana. ",
      english: "I'm so sorry. ",
      arabic: "أنا آسف جداً. "
    };
    const prefix = comfortPrefixes[language as keyof typeof comfortPrefixes] || comfortPrefixes.english;
    return `${prefix}${baseResponse}`;
  }
  
  return baseResponse;
};
