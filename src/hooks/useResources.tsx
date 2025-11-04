
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
      
      return data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes - resources don't change frequently
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};
