
import { supabase } from '@/integrations/supabase/client';

export interface RateLimitConfig {
  maxAttempts: number;
  windowMinutes: number;
  blockDurationMinutes: number;
}

export const defaultRateLimits: Record<string, RateLimitConfig> = {
  contact_submission: {
    maxAttempts: 5,
    windowMinutes: 60,
    blockDurationMinutes: 60
  },
  login_attempt: {
    maxAttempts: 10,
    windowMinutes: 15,
    blockDurationMinutes: 30
  }
};

export const checkRateLimit = async (
  identifier: string,
  actionType: string,
  config?: RateLimitConfig
): Promise<{ allowed: boolean; resetTime?: Date }> => {
  const limitConfig = config || defaultRateLimits[actionType];
  if (!limitConfig) return { allowed: true };

  try {
    const windowStart = new Date();
    windowStart.setMinutes(windowStart.getMinutes() - limitConfig.windowMinutes);

    // Check existing rate limit record
    const { data: existingLimit } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('identifier', identifier)
      .eq('action_type', actionType)
      .gte('window_start', windowStart.toISOString())
      .single();

    if (existingLimit) {
      // Check if currently blocked
      if (existingLimit.blocked_until && new Date() < new Date(existingLimit.blocked_until)) {
        return { 
          allowed: false, 
          resetTime: new Date(existingLimit.blocked_until) 
        };
      }

      // Check if within rate limit
      if (existingLimit.attempt_count >= limitConfig.maxAttempts) {
        const blockedUntil = new Date();
        blockedUntil.setMinutes(blockedUntil.getMinutes() + limitConfig.blockDurationMinutes);

        await supabase
          .from('rate_limits')
          .update({
            blocked_until: blockedUntil.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingLimit.id);

        return { allowed: false, resetTime: blockedUntil };
      }

      // Increment attempt count
      await supabase
        .from('rate_limits')
        .update({
          attempt_count: existingLimit.attempt_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingLimit.id);
    } else {
      // Create new rate limit record
      await supabase
        .from('rate_limits')
        .insert({
          identifier,
          action_type: actionType,
          attempt_count: 1,
          window_start: new Date().toISOString()
        });
    }

    return { allowed: true };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return { allowed: true }; // Allow on error to prevent blocking legitimate users
  }
};
