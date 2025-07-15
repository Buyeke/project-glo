import { ChatMessage, Intent, Service } from '@/types/chatbot';
import { detectLanguageWithContext } from '@/utils/enhancedLanguageDetection';
import { generateCulturalResponse } from '@/utils/culturalResponseGenerator';
import { getEnhancedTranslation, enhanceResponseWithEmotion } from '@/utils/languageUtils';
import { matchIntent, matchService, getFallbackResponse, translateText } from '@/utils/intentMatcher';

export const useChatMessageProcessor = (intents: Intent[], services: Service[]) => {
  const processMessage = async (
    userMessage: string, 
    messages: ChatMessage[], 
    forcedLanguage?: string
  ): Promise<{ userMsg: ChatMessage; botMsg: ChatMessage }> => {
    console.log('Processing message:', userMessage);
    
    // Use enhanced language detection
    const detection = detectLanguageWithContext(userMessage);
    const detectedLanguage = forcedLanguage || detection.language;
    const emotionalState = detectEmotionalState(userMessage, detectedLanguage);
    
    console.log('Enhanced detection:', {
      language: detectedLanguage,
      confidence: detection.confidence,
      formality: detection.formality,
      context: detection.context,
      emotionalState
    });

    // Try enhanced translation first
    let messageForMatching = userMessage;
    if (detectedLanguage !== 'english') {
      const enhancedTranslation = getEnhancedTranslation(userMessage, detectedLanguage, 'english');
      if (enhancedTranslation) {
        messageForMatching = enhancedTranslation;
        console.log('Enhanced translation used:', messageForMatching);
      } else {
        try {
          messageForMatching = await translateText(userMessage, detectedLanguage, 'english');
          console.log('Fallback translation:', messageForMatching);
        } catch (error) {
          console.error('Translation failed:', error);
        }
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
      // Use enhanced service response generation
      const service = matchedServices[0];
      matchedServiceId = service.id;
      
      const features = Array.isArray(service.key_features) 
        ? service.key_features.map(feature => `• ${feature}`).join('\n')
        : '• Professional support available';

      // Generate culturally appropriate service intro
      const serviceIntro = generateServiceResponseIntro(detectedLanguage, emotionalState, detection.formality);
      response = `${serviceIntro}\n\n🔹 ${service.title}\n${service.description}\n\nKey Features:\n${features}`;
      
      // Add contact information with cultural context
      if (service.contact_phone) {
        const callText = getCallText(detectedLanguage, detection.formality);
        response += `\n\n📞 ${callText}: ${service.contact_phone}`;
      }
      
      if (service.contact_url) {
        const moreInfoText = getMoreInfoText(detectedLanguage, detection.formality);
        response += `\n🌐 ${moreInfoText}: ${service.contact_url}`;
      }

      // Add culturally appropriate encouragement
      if (emotionalState === 'distressed') {
        const encouragement = generateCulturalResponse(userMessage, 'encouragement', detectedLanguage);
        response += `\n\n${encouragement.text}`;
      }

      console.log('Using enhanced service response for:', service.title);
    } else if (intent && confidence > 0) {
      // Enhanced intent response with cultural context
      let baseResponse = intent.response_template[detectedLanguage] || 
                        intent.response_template['english'] || 
                        getFallbackResponse(detectedLanguage);
      
      // Enhance with emotional and cultural context
      response = enhanceResponseWithEmotion(baseResponse, emotionalState, detectedLanguage);
      matchedIntent = intent.intent_key;
      console.log('Using enhanced intent response:', response);
    } else {
      // Enhanced fallback with cultural greeting and formality
      const culturalResponse = generateCulturalResponse(userMessage, 'help', detectedLanguage);
      response = culturalResponse.text;
      console.log('Using enhanced cultural fallback:', response);
    }

    // Add cultural sign-off based on emotional state
    if (emotionalState === 'grateful') {
      const gratefulResponse = generateCulturalResponse(userMessage, 'thanks', detectedLanguage);
      response += `\n\n${gratefulResponse.text}`;
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
      translatedFrom: messageForMatching !== userMessage ? detectedLanguage : undefined,
    };

    return { userMsg, botMsg };
  };

  return { processMessage };
};

// Enhanced helper functions with cultural awareness
const generateServiceResponseIntro = (language: string, emotionalState: string, formality: 'casual' | 'formal' | 'mixed'): string => {
  const intros = {
    urgent: {
      sheng: {
        casual: "Emergency bro! Niko na service ya haraka:",
        formal: "Hii ni dharura. Nina huduma ya haraka:",
        mixed: "Emergency! Niko na service ya haraka:"
      },
      swahili: {
        casual: "Hii ni dharura! Nina huduma ya haraka:",
        formal: "Naona hii ni dharura kubwa. Nina huduma inayoweza kusaidia:",
        mixed: "Dharura! Nina huduma ya haraka:"
      },
      english: {
        casual: "Emergency! Here's immediate help:",
        formal: "I understand this is urgent. Here's immediate assistance:",
        mixed: "This is urgent! Here's quick help:"
      }
    },
    distressed: {
      sheng: {
        casual: "Pole sana bro. Tutakusaidia. Hii service inaweza help:",
        formal: "Pole sana kwa hali hii. Hii ni huduma inayoweza kusaidia:",
        mixed: "Pole sana rafiki. Hii service itakusaidia:"
      },
      swahili: {
        casual: "Pole sana. Hii huduma itakusaidia:",
        formal: "Samahani sana kwa hali hii. Hii ni huduma inayoweza kukusaidia:",
        mixed: "Pole sana. Nina huduma inayoweza kusaidia:"
      },
      english: {
        casual: "I'm sorry you're going through this. Here's help:",
        formal: "I sincerely sympathize with your situation. Here's a service that can help:",
        mixed: "Sorry about this. Here's a service that can help:"
      }
    },
    neutral: {
      sheng: {
        casual: "Poa, nimepata service inayofaa kwako:",
        formal: "Nimepata huduma inayokufaa:",
        mixed: "Sawa, nina service inayofaa:"
      },
      swahili: {
        casual: "Nimepata huduma inayokufaa:",
        formal: "Nina huduma inayoweza kukusaidia:",
        mixed: "Nimepata huduma nzuri kwako:"
      },
      english: {
        casual: "Found a service that matches your needs:",
        formal: "I have identified a service that may assist you:",
        mixed: "Here's a service that fits your needs:"
      }
    }
  };
  
  const stateIntros = intros[emotionalState as keyof typeof intros] || intros.neutral;
  const langIntros = stateIntros[language as keyof typeof stateIntros] || stateIntros.english;
  return langIntros[formality];
};

const getCallText = (language: string, formality: 'casual' | 'formal' | 'mixed'): string => {
  const callTexts = {
    sheng: { casual: 'Call', formal: 'Piga simu', mixed: 'Call/Piga simu' },
    swahili: { casual: 'Piga simu', formal: 'Piga simu', mixed: 'Piga simu' },
    english: { casual: 'Call', formal: 'Contact', mixed: 'Call' },
    arabic: { casual: 'اتصل', formal: 'اتصل', mixed: 'اتصل' }
  };
  
  const langTexts = callTexts[language as keyof typeof callTexts] || callTexts.english;
  return langTexts[formality];
};

const getMoreInfoText = (language: string, formality: 'casual' | 'formal' | 'mixed'): string => {
  const infoTexts = {
    sheng: { casual: 'More info', formal: 'Maelezo zaidi', mixed: 'More info' },
    swahili: { casual: 'Maelezo zaidi', formal: 'Taarifa zaidi', mixed: 'Maelezo zaidi' },
    english: { casual: 'More info', formal: 'Additional information', mixed: 'More info' },
    arabic: { casual: 'معلومات أكثر', formal: 'مزيد من المعلومات', mixed: 'معلومات أكثر' }
  };
  
  const langTexts = infoTexts[language as keyof typeof infoTexts] || infoTexts.english;
  return langTexts[formality];
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
