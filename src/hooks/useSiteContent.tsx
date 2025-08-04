
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SiteContent {
  id: string;
  content_key: string;
  content_value: any;
  content_type: string;
  section: string;
  description?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export const useSiteContent = () => {
  return useQuery({
    queryKey: ['site-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .eq('published', true)
        .order('content_key');
      
      if (error) throw error;
      
      // Transform data into a more usable format
      const contentMap: Record<string, any> = {};
      data?.forEach(item => {
        contentMap[item.content_key] = item.content_value;
      });
      
      return { items: data, contentMap };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useContentValue = (key: string, fallback: any = '') => {
  const { data } = useSiteContent();
  return data?.contentMap?.[key] || fallback;
};
