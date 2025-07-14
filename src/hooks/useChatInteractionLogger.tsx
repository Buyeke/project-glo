
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ChatInteraction } from '@/types/chatbot';

export const useChatInteractionLogger = () => {
  const { user } = useAuth();

  const logInteractionMutation = useMutation({
    mutationFn: async (interaction: ChatInteraction) => {
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

  return {
    logInteraction: logInteractionMutation.mutate,
  };
};
