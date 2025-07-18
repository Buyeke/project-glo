
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  embedding?: number[];
  relevance_score?: number;
}

export const useKnowledgeBase = () => {
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchKnowledge = async (query: string, limit: number = 5): Promise<KnowledgeItem[]> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('search-knowledge', {
        body: { query, limit }
      });

      if (error) throw error;
      
      return data.results || [];
    } catch (error) {
      console.error('Knowledge search error:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const addKnowledgeItem = async (item: Omit<KnowledgeItem, 'id' | 'embedding'>) => {
    try {
      const { data, error } = await supabase.functions.invoke('add-knowledge', {
        body: item
      });

      if (error) throw error;
      
      setKnowledgeItems(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error adding knowledge item:', error);
      throw error;
    }
  };

  return {
    knowledgeItems,
    searchKnowledge,
    addKnowledgeItem,
    isLoading
  };
};
