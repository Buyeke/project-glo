
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
        .select('id, category, intent_key, keywords, response_template');
      
      if (error) {
        console.error('Error fetching intents:', error);
        throw error;
      }
      
      console.log('Fetched intents:', data);
      return data as Intent[];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - intents are relatively static
    gcTime: 60 * 60 * 1000, // 1 hour
  });

  // Fetch services from database
  const { data: services = [], isLoading: isLoadingServices } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      console.log('Fetching services...');
      const { data, error } = await supabase
        .from('services')
        .select('id, title, description, category, priority_level, language_support, contact_phone, contact_url, location, delivery_mode')
        .eq('availability', 'Available');
      
      if (error) {
        console.error('Error fetching services:', error);
        throw error;
      }
      
      console.log('Fetched services:', data);
      return data?.map(service => ({
        ...service,
        key_features: [],
        availability: 'Available'
      })) as Service[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  return {
    intents,
    services,
    isLoadingIntents,
    isLoadingServices,
  };
};
