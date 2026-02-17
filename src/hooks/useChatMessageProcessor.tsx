import { ChatMessage, Intent, Service } from '@/types/chatbot';
import { detectLanguageWithContext } from '@/utils/enhancedLanguageDetection';
import { generateCulturalResponse } from '@/utils/culturalResponseGenerator';
import { getEnhancedTranslation, enhanceResponseWithEmotion, detectEmotionalState } from '@/utils/languageUtils';
import { enhancedMatchIntent } from '@/utils/enhancedIntentMatcher';
import { matchService, getFallbackResponse, translateText } from '@/utils/intentMatcher';
import { formatEmergencyContactsForChat } from '@/utils/emergencyDetection';

export const useChatMessageProcessor = (intents: Intent[], services: Service[]) => {
  const processMessage = async (
    userMessage: string, 
    messages: ChatMessage[], 
    forcedLanguage?: string,
    knowledgeContext?: string
  ): Promise<{ userMsg: ChatMessage; botMsg: ChatMessage }> => {
    console.log('Processing message with enhanced Sheng matching:', userMessage);
    
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

    // Enhanced translation for matching
    let messageForMatching = userMessage;
    if (detectedLanguage !== 'english') {
      const enhancedTranslation = getEnhancedTranslation(userMessage, 'english');
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

    // Use enhanced intent matching with Sheng expressions
    console.log('Starting enhanced intent matching with', intents.length, 'intents');
    const { intent, confidence, shengMatch, urgency, category } = enhancedMatchIntent(
      userMessage, 
      intents, 
      detectedLanguage
    );
    
    console.log('Enhanced intent matching result:', {
      intent: intent?.intent_key,
      confidence,
      shengMatch: shengMatch?.sheng,
      urgency,
      category,
      hasIntent: !!intent
    });

    // Service matching with enhanced context
    console.log('Starting service matching with', services.length, 'services');
    const matchedServices = matchService(userMessage, services);
    console.log('Service matching result:', matchedServices);

    let response: string;
    let matchedIntent: string | undefined;
    let matchedServiceId: string | undefined;

    if (matchedServices.length > 0) {
      // Enhanced service response generation
      const service = matchedServices[0];
      matchedServiceId = service.id;
      
      const features = Array.isArray(service.key_features) 
        ? service.key_features.map(feature => `• ${feature}`).join('\n')
        : '• Professional support available';

      // Generate culturally appropriate service intro with urgency awareness
      const serviceIntro = generateServiceResponseIntro(detectedLanguage, urgency || 'medium', detection.formality);
      response = `${serviceIntro}\n\n${service.title}\n${service.description}\n\nKey Features:\n${features}`;
      
      // Add contact information with cultural context
      if (service.contact_phone) {
        const callText = getCallText(detectedLanguage, detection.formality);
        response += `\n\n${callText}: ${service.contact_phone}`;
      }
      
      if (service.contact_url) {
        const moreInfoText = getMoreInfoText(detectedLanguage, detection.formality);
        response += `\n${moreInfoText}: ${service.contact_url}`;
      }

      // Add trauma-informed encouragement for critical situations
      if (urgency === 'critical' || urgency === 'high') {
        const encouragement = generateTraumaInformedEncouragement(detectedLanguage);
        response += `\n\n${encouragement}`;
      }

      console.log('Using enhanced service response for:', service.title);
    } else if (intent && confidence > 0) {
      // Enhanced intent response with trauma-informed context
      let baseResponse = intent.response_template[detectedLanguage] || 
                        intent.response_template['english'] || 
                        getFallbackResponse(detectedLanguage);
      
      // Add urgency indicators for critical situations
      if (urgency === 'critical') {
        baseResponse = `**URGENT**\n\n${baseResponse}`;
        baseResponse += formatEmergencyContactsForChat();
      } else if (urgency === 'high') {
        baseResponse = `**PRIORITY**\n\n${baseResponse}`;
      }
      
      // Enhance with emotional and cultural context
      response = enhanceResponseWithEmotion(baseResponse, emotionalState.state);
      matchedIntent = intent.intent_key;
      
      // Add immediate safety note for critical situations
      if (urgency === 'critical' && (category === 'emergency' || category === 'legal')) {
        const safetyNote = getSafetyNote(detectedLanguage);
        response += `\n\n${safetyNote}`;
      }
      
      console.log('Using enhanced intent response:', response);
    } else if (knowledgeContext && knowledgeContext.trim().length > 0) {
      // Use knowledge base results as fallback instead of generic response
      const kbLines = knowledgeContext.split('\n\n');
      const firstEntry = kbLines[0] || '';
      const titleMatch = firstEntry.match(/Title: (.+)/);
      const contentMatch = firstEntry.match(/Content: (.+)/);
      
      if (contentMatch) {
        const title = titleMatch ? titleMatch[1] : '';
        response = title ? `${title}\n\n${contentMatch[1]}` : contentMatch[1];
      } else {
        const culturalResponse = generateCulturalResponse(userMessage, 'help', detectedLanguage);
        response = culturalResponse.text;
      }
      
      const clarificationText = getClarificationText(detectedLanguage);
      response += `\n\n${clarificationText}`;
      console.log('Using knowledge base fallback:', response.substring(0, 80));
    } else {
      // Enhanced fallback with cultural greeting and trauma-informed care
      const culturalResponse = generateCulturalResponse(userMessage, 'help', detectedLanguage);
      response = culturalResponse.text;
      
      // Add gentle clarification request
      const clarificationText = getClarificationText(detectedLanguage);
      response += `\n\n${clarificationText}`;
      
      console.log('Using enhanced cultural fallback:', response);
    }

    // Add cultural sign-off based on emotional state and urgency
    if (emotionalState.state === 'grateful') {
      const gratefulResponse = generateCulturalResponse(userMessage, 'thanks', detectedLanguage);
      response += `\n\n${gratefulResponse.text}`;
    } else if (urgency === 'critical' || urgency === 'high') {
      const supportNote = getSupportNote(detectedLanguage);
      response += `\n\n${supportNote}`;
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
      degraded: true,
    };

    return { userMsg, botMsg };
  };

  return { processMessage };
};

// Additional helper functions for enhanced trauma-informed responses
const generateTraumaInformedEncouragement = (language: string): string => {
  const encouragements = {
    sheng: "Mresh, haumo peke yako kwa hii. Tutakusaidia step by step. Unaweza pause wakati wowote.",
    swahili: "Rafiki, haumo peke yako. Tutakusaidia polepole. Unaweza kupumzika wakati wowote.",
    english: "You're not alone in this. We'll help you step by step. You can pause anytime you need to.",
    arabic: "لست وحدك في هذا. سنساعدك خطوة بخطوة. يمكنك التوقف في أي وقت تحتاجينه."
  };
  
  return encouragements[language as keyof typeof encouragements] || encouragements.sheng;
};

const getSafetyNote = (language: string): string => {
  const contacts = formatEmergencyContactsForChat();
  const safetyNotes = {
    sheng: `Uko safe hapa. Kama uko kwa danger sasa hivi:${contacts}`,
    swahili: `Uko salama hapa. Kama uko katika hatari sasa hivi:${contacts}`,
    english: `You're safe here. If you're in immediate danger:${contacts}`,
    arabic: `أنت آمنة هنا. إذا كنت في خطر فوري:${contacts}`
  };
  
  return safetyNotes[language as keyof typeof safetyNotes] || safetyNotes.sheng;
};

const getClarificationText = (language: string): string => {
  const clarifications = {
    sheng: "Sijaelewa vizuri, uneza eleza tena polepole?",
    swahili: "Sijaelewa vizuri, unaweza kueleza tena polepole?",
    english: "I didn't understand clearly, can you explain again slowly?",
    arabic: "لم أفهم بوضوح، هل يمكنك التوضيح مرة أخرى ببطء؟"
  };
  
  return clarifications[language as keyof typeof clarifications] || clarifications.sheng;
};

const getSupportNote = (language: string): string => {
  const supportNotes = {
    sheng: "Nitakuwa nayo through hii journey. Unaweza niongelesha wakati wowote.",
    swahili: "Nitakuwa pamoja nawe katika safari hii. Unaweza kuniongelesha wakati wowote.",
    english: "I'll be with you through this journey. You can talk to me anytime.",
    arabic: "سأكون معك في هذه الرحلة. يمكنك التحدث معي في أي وقت."
  };
  
  return supportNotes[language as keyof typeof supportNotes] || supportNotes.sheng;
};

const generateServiceResponseIntro = (language: string, urgency: string, formality: 'casual' | 'formal' | 'mixed'): string => {
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
  
  const stateIntros = intros[urgency as keyof typeof intros] || intros.neutral;
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
