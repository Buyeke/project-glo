
import { supabase } from '@/integrations/supabase/client';
import { getClientIP } from './securityLogger';

export interface RateLimitResult {
  allowed: boolean;
  resetTime?: Date;
  reason?: string;
  message?: string;
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
      // SECURITY FIX: Deny on error instead of allowing
      return { 
        allowed: false, 
        reason: 'service_error',
        message: 'Unable to verify request. Please try again later.'
      };
    }

    if (data?.error) {
      console.error('Rate limit check returned error:', data.error);
      return { 
        allowed: false, 
        reason: data.reason || 'service_error',
        message: data.message || 'Request blocked for security reasons.'
      };
    }

    return data as RateLimitResult;
  } catch (error) {
    console.error('Rate limit check error:', error);
    // SECURITY FIX: Deny on error instead of allowing
    return { 
      allowed: false, 
      reason: 'network_error',
      message: 'Network error. Please check your connection and try again.'
    };
  }
};
