import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, endOfDay, subDays } from 'date-fns';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface SatisfactionMetrics {
  avgRating: number;
  totalFeedback: number;
  distribution: Record<number, number>;
  feedbackTypes: Record<string, number>;
  avgResponseRelevance: number;
  avgLanguageQuality: number;
  avgCulturalSensitivity: number;
}

export const useChatbotSatisfaction = (dateRange?: DateRange) => {
  const start = dateRange?.start || subDays(new Date(), 7);
  const end = dateRange?.end || new Date();

  return useQuery({
    queryKey: ['chatbot-satisfaction', start, end],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chatbot_feedback')
        .select('rating, feedback_type, response_relevance, language_quality, cultural_sensitivity, created_at')
        .gte('created_at', startOfDay(start).toISOString())
        .lte('created_at', endOfDay(end).toISOString());

      if (error) throw error;

      if (!data || data.length === 0) {
        return {
          avgRating: 0,
          totalFeedback: 0,
          distribution: {},
          feedbackTypes: {},
          avgResponseRelevance: 0,
          avgLanguageQuality: 0,
          avgCulturalSensitivity: 0
        } as SatisfactionMetrics;
      }

      // Calculate average rating
      const avgRating = data.reduce((sum, f) => sum + f.rating, 0) / data.length;

      // Calculate rating distribution (1-5 stars)
      const distribution = data.reduce((acc: Record<number, number>, f) => {
        acc[f.rating] = (acc[f.rating] || 0) + 1;
        return acc;
      }, {});

      // Count feedback types
      const feedbackTypes = data.reduce((acc: Record<string, number>, f) => {
        acc[f.feedback_type] = (acc[f.feedback_type] || 0) + 1;
        return acc;
      }, {});

      // Calculate averages for detailed metrics
      const withRelevance = data.filter(f => f.response_relevance !== null);
      const avgResponseRelevance = withRelevance.length > 0
        ? withRelevance.reduce((sum, f) => sum + (f.response_relevance || 0), 0) / withRelevance.length
        : 0;

      const withLanguageQuality = data.filter(f => f.language_quality !== null);
      const avgLanguageQuality = withLanguageQuality.length > 0
        ? withLanguageQuality.reduce((sum, f) => sum + (f.language_quality || 0), 0) / withLanguageQuality.length
        : 0;

      const withCulturalSensitivity = data.filter(f => f.cultural_sensitivity !== null);
      const avgCulturalSensitivity = withCulturalSensitivity.length > 0
        ? withCulturalSensitivity.reduce((sum, f) => sum + (f.cultural_sensitivity || 0), 0) / withCulturalSensitivity.length
        : 0;

      return {
        avgRating,
        totalFeedback: data.length,
        distribution,
        feedbackTypes,
        avgResponseRelevance,
        avgLanguageQuality,
        avgCulturalSensitivity
      } as SatisfactionMetrics;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useLowSatisfactionResponses = (threshold: number = 2) => {
  return useQuery({
    queryKey: ['low-satisfaction-responses', threshold],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chatbot_feedback')
        .select('*, chat_interactions!inner(*)')
        .lte('rating', threshold)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
