
import { supabase } from '@/integrations/supabase/client';
import { getClientIP } from './securityLogger';

export interface RateLimitResult {
  allowed: boolean;
  resetTime?: Date;
  reason?: string;
}

export const checkRateLimit = async (
  identifier: string,
  actionType: string
): Promise<RateLimitResult> => {
  try {
    const clientIP = await getClientIP();

    const { data, error } = await supabase.functions.invoke('rate-limit-check', {
      body: {
        identifier,
        actionType,
        clientIP
      }
    });

    if (error) {
      console.error('Rate limit check failed:', error);
      return { allowed: true }; // Allow on error to prevent blocking legitimate users
    }

    return data as RateLimitResult;
  } catch (error) {
    console.error('Rate limit check error:', error);
    return { allowed: true }; // Allow on error to prevent blocking legitimate users
  }
};
