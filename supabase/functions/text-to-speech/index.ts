
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://fznhhkxwzqipwfwihwqr.supabase.co',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required', request_id: requestId }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token', request_id: requestId }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { text, voice = 'custom' } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text is required', request_id: requestId }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!elevenLabsApiKey) {
      console.error('ElevenLabs API key not configured');
      return new Response(
        JSON.stringify({ error: 'Text-to-speech service not configured', request_id: requestId }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ElevenLabs voice mapping - now includes your custom voice as default
    const voiceIds = {
      'custom': 'reKB9ckO5n20wBEh66qg', // Your custom voice as default
      'alloy': '9BWtsMINqrJLrRacOk9x', // Aria
      'echo': 'CwhRBWXzGAHq8TQ4Fs17', // Roger
      'fable': 'EXAVITQu4vr4xnSDxMaL', // Sarah
      'onyx': 'FGY2WhTYpPnrIDTdsKH5', // Laura
      'nova': 'IKne3meq5aSn9XLyUdCD', // Charlie
      'shimmer': 'JBFqnCBsd6RMkjVDRZzb' // George
    };

    const voiceId = voiceIds[voice as keyof typeof voiceIds] || voiceIds.custom;

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.0,
          use_speaker_boost: true
        }
      }),
    });

    if (!response.ok) {
      console.error('ElevenLabs API error:', response.status);
      return new Response(
        JSON.stringify({ error: 'Text-to-speech conversion failed', request_id: requestId }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // Log usage for security monitoring
    await supabaseAuth.from('security_logs').insert({
      event_type: 'admin_access',
      user_id: user.id,
      event_data: {
        action: 'text_to_speech_used',
        text_length: text.length,
        voice_used: voice
      },
      ip_address: req.headers.get('cf-connecting-ip') || 'unknown'
    });

    return new Response(
      JSON.stringify({ audioContent: base64Audio, request_id: requestId }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Text-to-speech error:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred while processing your request', request_id: requestId }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
