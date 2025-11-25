import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface ChatbotFeedback {
  chatInteractionId: string;
  rating: number;
  feedbackType: 'helpful' | 'not_helpful' | 'accurate' | 'inaccurate' | 'culturally_appropriate' | 'needs_improvement';
  comment?: string;
  responseRelevance?: number;
  languageQuality?: number;
  culturalSensitivity?: number;
  anonymous?: boolean;
}

export const useChatbotFeedback = () => {
  const { user } = useAuth();

  const submitFeedback = useMutation({
    mutationFn: async (feedback: ChatbotFeedback) => {
      const { error } = await supabase
        .from('chatbot_feedback')
        .insert({
          user_id: feedback.anonymous ? null : user?.id,
          chat_interaction_id: feedback.chatInteractionId,
          rating: feedback.rating,
          feedback_type: feedback.feedbackType,
          comment: feedback.comment,
          response_relevance: feedback.responseRelevance,
          language_quality: feedback.languageQuality,
          cultural_sensitivity: feedback.culturalSensitivity,
          anonymous: feedback.anonymous || false
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Thank you for your feedback! 💜', {
        description: 'Your input helps us improve GLO for everyone.'
      });
    },
    onError: (error) => {
      console.error('Failed to submit feedback:', error);
      toast.error('Failed to submit feedback', {
        description: 'Please try again later.'
      });
    }
  });

  return {
    submitFeedback: submitFeedback.mutate,
    isSubmitting: submitFeedback.isPending
  };
};
