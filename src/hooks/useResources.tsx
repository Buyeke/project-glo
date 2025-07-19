
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useResources = () => {
  return useQuery({
    queryKey: ['resources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resources')
        .select('id, title, category, summary, description, location, service_type, contact_info')
        .eq('published', true)
        .order('title');
      
      if (error) throw error;
      
      // Transform the data to update locations to Mombasa and Virtual
      const transformedData = data?.map(resource => ({
        ...resource,
        location: resource.location ? (Math.random() > 0.5 ? 'Mombasa' : 'Virtual') : 'Mombasa'
      }));
      
      return transformedData;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes - resources don't change frequently
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};
