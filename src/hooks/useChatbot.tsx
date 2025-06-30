
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { detectLanguage } from '@/utils/languageUtils';
import { matchIntent, getFallbackResponse } from '@/utils/intentMatcher';
import { toast } from 'sonner';

interface ChatMessage {
  id: number;
  text: string;
  isBot: boolean;
  language?: string;
  translatedFrom?: string;
  intent?: string;
  confidence?: number;
}

interface Intent {
  id: string;
  category: string;
  intent_key: string;
  keywords: Record<string, string[]>;
  response_template: Record<string, string>;
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
  const { data: intents = [] } = useQuery({
    queryKey: ['chatbot-intents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chatbot_intents')
        .select('*');
      
      if (error) throw error;
      return data as Intent[];
    },
  });

  // Log chat interaction
  const logInteractionMutation = useMutation({
    mutationFn: async (interaction: {
      original_message: string;
      detected_language: string;
      translated_message?: string;
      matched_intent?: string;
      response: string;
      translated_response?: string;
      confidence_score?: number;
    }) => {
      if (!user) return;

      const { error } = await supabase
        .from('chat_interactions')
        .insert({
          user_id: user.id,
          ...interaction,
        });

      if (error) throw error;
    },
    onError: (error) => {
      console.error('Error logging chat interaction:', error);
    },
  });

  const processMessage = async (userMessage: string, forcedLanguage?: string) => {
    const detectedLanguage = forcedLanguage || detectLanguage(userMessage);
    console.log('Detected language:', detectedLanguage);

    // Match intent
    const { intent, confidence } = matchIntent(userMessage, intents, detectedLanguage);
    console.log('Matched intent:', intent?.intent_key, 'Confidence:', confidence);

    let response: string;
    let matchedIntent: string | undefined;

    if (intent && confidence > 0.3) {
      response = intent.response_template[detectedLanguage] || intent.response_template['english'] || getFallbackResponse(detectedLanguage);
      matchedIntent = intent.intent_key;
    } else {
      response = getFallbackResponse(detectedLanguage);
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
    };

    setMessages(prev => [...prev, userMsg, botMsg]);

    // Log interaction
    if (user) {
      logInteractionMutation.mutate({
        original_message: userMessage,
        detected_language: detectedLanguage,
        matched_intent: matchedIntent,
        response: response,
        confidence_score: confidence,
      });
    }

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
    isLoadingIntents: !intents.length,
  };
};
