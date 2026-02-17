
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
      
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      // Choose endpoint based on auth status
      const functionName = session ? 'ai-chat-processor' : 'ai-chat-public';
      const headers: Record<string, string> = {};
      
      if (session) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: request,
        headers,
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
      if (error.message.includes('Rate limit') || error.message.includes('Too many')) {
        toast.error('Too many requests. Please wait before trying again.');
      } else if (error.message.includes('402') || error.message.includes('payment')) {
        toast.error('AI service temporarily unavailable.');
      } else {
        toast.error('AI processing failed, falling back to basic responses');
      }
    },
  });

  return {
    processWithAI: processWithAI.mutate,
    isProcessing: processWithAI.isPending,
    error: processWithAI.error,
  };
};
