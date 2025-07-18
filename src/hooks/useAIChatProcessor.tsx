
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from '@/types/chatbot';
import { toast } from 'sonner';

interface AIProcessorRequest {
  message: string;
  conversationHistory: ChatMessage[];
  language?: string;
  knowledgeContext?: string;
}

interface AIProcessorResponse {
  response: string;
  analysis: {
    intent: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    emotional_state: string;
    services_needed: string[];
    confidence: number;
    requires_human: boolean;
    language_detected: string;
  };
  matchedServices: any[];
  conversationMetadata: {
    intent: string;
    confidence: number;
    urgency: string;
    emotional_state: string;
    requires_human: boolean;
  };
}

export const useAIChatProcessor = () => {
  const processWithAI = useMutation({
    mutationFn: async (request: AIProcessorRequest): Promise<AIProcessorResponse> => {
      console.log('Processing message with AI:', request.message);
      
      const { data, error } = await supabase.functions.invoke('ai-chat-processor', {
        body: request
      });

      if (error) {
        console.error('AI processing error:', error);
        throw new Error(error.message || 'Failed to process with AI');
      }

      if (data.error) {
        console.error('AI processor returned error:', data.error);
        throw new Error(data.error);
      }

      console.log('AI processing successful:', data.analysis);
      return data;
    },
    onError: (error) => {
      console.error('AI chat processing failed:', error);
      toast.error('AI processing failed, falling back to basic responses');
    },
  });

  return {
    processWithAI: processWithAI.mutate,
    isProcessing: processWithAI.isPending,
    error: processWithAI.error,
  };
};
