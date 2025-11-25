import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, endOfDay, subDays } from 'date-fns';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface AIMetricsSummary {
  date: string;
  model_name: string;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  avg_response_time_ms: number;
  median_response_time_ms: number;
  p95_response_time_ms: number;
  avg_tokens: number;
  total_tokens_sum: number;
  total_cost_usd: number;
}

export interface AIMetricsDetail {
  id: string;
  user_id: string;
  model_name: string;
  response_time_ms: number;
  total_tokens: number;
  estimated_cost_usd: number;
  request_success: boolean;
  error_type?: string;
  created_at: string;
}

export const useAIMetrics = (dateRange?: DateRange) => {
  const start = dateRange?.start || subDays(new Date(), 7);
  const end = dateRange?.end || new Date();

  return useQuery({
    queryKey: ['ai-metrics-summary', start, end],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_performance_summary')
        .select('*')
        .gte('date', startOfDay(start).toISOString())
        .lte('date', endOfDay(end).toISOString())
        .order('date', { ascending: false });

      if (error) throw error;
      return data as AIMetricsSummary[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useAIMetricsDetails = (dateRange?: DateRange) => {
  const start = dateRange?.start || subDays(new Date(), 1);
  const end = dateRange?.end || new Date();

  return useQuery({
    queryKey: ['ai-metrics-details', start, end],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_model_metrics')
        .select('*')
        .gte('created_at', startOfDay(start).toISOString())
        .lte('created_at', endOfDay(end).toISOString())
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;
      return data as AIMetricsDetail[];
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useAIErrorMetrics = (dateRange?: DateRange) => {
  const start = dateRange?.start || subDays(new Date(), 7);
  const end = dateRange?.end || new Date();

  return useQuery({
    queryKey: ['ai-error-metrics', start, end],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_model_metrics')
        .select('error_type, response_time_ms, created_at')
        .eq('request_success', false)
        .gte('created_at', startOfDay(start).toISOString())
        .lte('created_at', endOfDay(end).toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by error type
      const errorsByType = data.reduce((acc: Record<string, number>, item) => {
        const errorType = item.error_type || 'unknown_error';
        acc[errorType] = (acc[errorType] || 0) + 1;
        return acc;
      }, {});

      return {
        errors: data,
        errorsByType,
        totalErrors: data.length
      };
    },
    staleTime: 2 * 60 * 1000,
  });
};
