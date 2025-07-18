
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  relevance_score?: number;
}

export const useKnowledgeBase = () => {
  const [isLoading, setIsLoading] = useState(false);

  const searchKnowledge = async (query: string, limit: number = 5): Promise<KnowledgeItem[]> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('search-knowledge', {
        body: { query, limit }
      });

      if (error) {
        console.error('Knowledge search error:', error);
        return [];
      }

      return (data?.results || []) as KnowledgeItem[];
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const addKnowledgeItem = async (item: Omit<KnowledgeItem, 'id'>): Promise<KnowledgeItem | null> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await (supabase as any)
        .from('knowledge_base')
        .insert({
          title: item.title,
          content: item.content,
          category: item.category,
          tags: item.tags
        })
        .select()
        .single();

      if (error) throw error;

      return data as KnowledgeItem;
    } catch (error) {
      console.error('Error adding knowledge item:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getKnowledgeByCategory = async (category: string): Promise<KnowledgeItem[]> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await (supabase as any)
        .from('knowledge_base')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []) as KnowledgeItem[];
    } catch (error) {
      console.error('Error fetching knowledge by category:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    searchKnowledge,
    addKnowledgeItem,
    getKnowledgeByCategory,
    isLoading
  };
};
