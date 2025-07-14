
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Intent, Service } from '@/types/chatbot';

export const useChatData = () => {
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

  return {
    intents,
    services,
    isLoadingIntents,
    isLoadingServices,
  };
};
