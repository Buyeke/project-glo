
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { detectLanguage } from '@/utils/languageUtils';
import { matchIntent, getFallbackResponse, translateText, matchService } from '@/utils/intentMatcher';
import { toast } from 'sonner';

interface ChatMessage {
  id: number;
  text: string;
  isBot: boolean;
  language?: string;
  translatedFrom?: string;
  intent?: string;
  confidence?: number;
  matchedService?: string;
}

interface Intent {
  id: string;
  category: string;
  intent_key: string;
  keywords: Record<string, string[]>;
  response_template: Record<string, string>;
}

interface Service {
  id: string;
  title: string;
  description: string;
  key_features: string[] | null;
  availability: string;
  priority_level: string;
  language_support: string;
  category: string;
  contact_phone: string | null;
  contact_url: string | null;
}

export const useChatbot = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: "Hi! I'm Glo's AI assistant. I'm here to help you navigate our services and find the support you need. We've helped 50+ women and 100+ children through our network of 10+ shelter partners. How can I assist you today?",
      isBot: true,
    },
  ]);
  const [currentLanguage, setCurrentLanguage] = useState('english');

  // Fetch intents from database
  const { data: intents = [], isLoading: isLoadingIntents } = useQuery({
    queryKey: ['chatbot-intents'],
    queryFn: async () => {
      console.log('Fetching chatbot intents...');
      const { data, error } = await supabase
        .from('chatbot_intents')
        .select('*');
      
      if (error) {
        console.error('Error fetching intents:', error);
        throw error;
      }
      
      console.log('Fetched intents:', data);
      return data as Intent[];
    },
  });

  // Fetch services from database
  const { data: services = [], isLoading: isLoadingServices } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      console.log('Fetching services...');
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('availability', 'Available');
      
      if (error) {
        console.error('Error fetching services:', error);
        throw error;
      }
      
      console.log('Fetched services:', data);
      return data as Service[];
    },
  });

  // Log chat interaction
  const logInteractionMutation = useMutation({
    mutationFn: async (interaction: {
      original_message: string;
      detected_language: string;
      translated_message?: string;
      matched_intent?: string;
      matched_service?: string;
      response: string;
      translated_response?: string;
      confidence_score?: number;
    }) => {
      if (!user) {
        console.log('No user logged in, skipping interaction log');
        return;
      }

      console.log('Logging interaction:', interaction);
      
      const { error } = await supabase
        .from('chat_interactions')
        .insert({
          user_id: user.id,
          ...interaction,
        });

      if (error) {
        console.error('Error logging interaction:', error);
        throw error;
      }
      
      console.log('Interaction logged successfully');
    },
    onError: (error) => {
      console.error('Error logging chat interaction:', error);
      toast.error('Failed to log chat interaction');
    },
  });

  const processMessage = async (userMessage: string, forcedLanguage?: string) => {
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

    // Add messages to chat
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

    setMessages(prev => [...prev, userMsg, botMsg]);

    // Log interaction (always log, even for fallback responses)
    logInteractionMutation.mutate({
      original_message: userMessage,
      detected_language: detectedLanguage,
      translated_message: messageForMatching !== userMessage ? messageForMatching : undefined,
      matched_intent: matchedIntent,
      matched_service: matchedServiceId,
      response: response,
      translated_response: translatedFrom ? finalResponse : undefined,
      confidence_score: confidence,
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
