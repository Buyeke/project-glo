
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useResources = () => {
  return useQuery({
    queryKey: ['resources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
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
  });
};
