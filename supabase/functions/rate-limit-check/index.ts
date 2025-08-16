
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
    maxAttempts: 5,
    windowMinutes: 60,
    blockDurationMinutes: 60
  },
  login_attempt: {
    maxAttempts: 10,
    windowMinutes: 15,
    blockDurationMinutes: 30
  },
  ai_chat: {
    maxAttempts: 30,
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
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const config = defaultRateLimits[actionType];
    if (!config) {
      return new Response(
        JSON.stringify({ allowed: true }),
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
            blocked_until: existingLimit.blocked_until
          },
          ip_address: clientIP
        });

        return new Response(
          JSON.stringify({ 
            allowed: false, 
            resetTime: new Date(existingLimit.blocked_until),
            reason: 'rate_limit_exceeded'
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
            blocked_until: blockedUntil.toISOString()
          },
          ip_address: clientIP
        });

        return new Response(
          JSON.stringify({ 
            allowed: false, 
            resetTime: blockedUntil,
            reason: 'rate_limit_exceeded'
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
    return new Response(
      JSON.stringify({ 
        allowed: true, // Allow on error to prevent blocking legitimate users
        error: 'Rate limit check failed'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
