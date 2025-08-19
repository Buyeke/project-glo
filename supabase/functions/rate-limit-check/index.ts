
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://fznhhkxwzqipwfwihwqr.supabase.co',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface RateLimitConfig {
  maxAttempts: number;
  windowMinutes: number;
  blockDurationMinutes: number;
}

const defaultRateLimits: Record<string, RateLimitConfig> = {
  contact_submission: {
    maxAttempts: 3, // Reduced from 5 for better protection
    windowMinutes: 60,
    blockDurationMinutes: 120 // Increased penalty
  },
  login_attempt: {
    maxAttempts: 5, // Reduced from 10
    windowMinutes: 15,
    blockDurationMinutes: 30
  },
  ai_chat: {
    maxAttempts: 20, // Reduced from 30
    windowMinutes: 60,
    blockDurationMinutes: 15
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { identifier, actionType, clientIP } = await req.json();
    
    if (!identifier || !actionType) {
      return new Response(
        JSON.stringify({ 
          allowed: false, 
          error: 'Missing required parameters',
          reason: 'invalid_request'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const config = defaultRateLimits[actionType];
    if (!config) {
      // Default deny for unknown action types
      return new Response(
        JSON.stringify({ 
          allowed: false,
          reason: 'unknown_action_type'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const windowStart = new Date();
    windowStart.setMinutes(windowStart.getMinutes() - config.windowMinutes);

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
        // Log security event for blocked attempt
        await supabase.from('security_logs').insert({
          event_type: 'rate_limit_exceeded',
          event_data: {
            identifier,
            action_type: actionType,
            attempt_count: existingLimit.attempt_count,
            blocked_until: existingLimit.blocked_until,
            severity: 'high'
          },
          ip_address: clientIP
        });

        return new Response(
          JSON.stringify({ 
            allowed: false, 
            resetTime: new Date(existingLimit.blocked_until),
            reason: 'rate_limit_exceeded',
            message: 'Too many attempts. Please try again later.'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if within rate limit
      if (existingLimit.attempt_count >= config.maxAttempts) {
        const blockedUntil = new Date();
        blockedUntil.setMinutes(blockedUntil.getMinutes() + config.blockDurationMinutes);

        await supabase
          .from('rate_limits')
          .update({
            blocked_until: blockedUntil.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingLimit.id);

        // Log security event for rate limit violation
        await supabase.from('security_logs').insert({
          event_type: 'rate_limit_exceeded',
          event_data: {
            identifier,
            action_type: actionType,
            max_attempts: config.maxAttempts,
            blocked_until: blockedUntil.toISOString(),
            severity: 'critical'
          },
          ip_address: clientIP
        });

        return new Response(
          JSON.stringify({ 
            allowed: false, 
            resetTime: blockedUntil,
            reason: 'rate_limit_exceeded',
            message: 'Rate limit exceeded. Access temporarily blocked.'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
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

    return new Response(
      JSON.stringify({ allowed: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Rate limit check failed:', error);
    
    // SECURITY FIX: Deny on error instead of allowing
    return new Response(
      JSON.stringify({ 
        allowed: false,
        error: 'Rate limit check failed',
        reason: 'service_error',
        message: 'Unable to verify request. Please try again.'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
