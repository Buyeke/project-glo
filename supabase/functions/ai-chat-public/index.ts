import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Simple in-memory IP rate limiter (10 req/min)
const ipRequests = new Map<string, number[]>();

function checkIPRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60_000;
  const maxRequests = 10;
  
  const timestamps = (ipRequests.get(ip) || []).filter(t => now - t < windowMs);
  if (timestamps.length >= maxRequests) return false;
  
  timestamps.push(now);
  ipRequests.set(ip, timestamps);
  
  // Cleanup old entries periodically
  if (ipRequests.size > 1000) {
    for (const [key, vals] of ipRequests) {
      if (vals.every(t => now - t > windowMs)) ipRequests.delete(key);
    }
  }
  
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = req.headers.get('cf-connecting-ip') || 
                    req.headers.get('x-forwarded-for')?.split(',')[0] || 
                    'unknown';

    if (!checkIPRateLimit(clientIP)) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please wait a moment.' }), {
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { message, conversationHistory, language = 'sheng', knowledgeContext = '' } = await req.json();

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'message is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sanitizedMessage = message.trim().substring(0, 1000);

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get services for context
    const { data: services } = await supabase
      .from('services')
      .select('title, description, category, contact_phone, contact_url')
      .eq('availability', 'Available')
      .limit(10);

    const serviceContext = services?.map((s: any) => `${s.title}: ${s.description}`).join('\n') || '';
    
    const conversationContext = conversationHistory?.slice(-3).map((msg: any) => 
      `${msg.isBot ? 'GLO' : 'User'}: ${msg.text}`
    ).join('\n') || '';

    const systemPrompt = `You are GLO, a trauma-informed, caring AI assistant who speaks in Sheng, Swahili, and English. You support homeless women and children in Kenya.

Respond in Sheng by default unless the user writes in English or Swahili. Be warm, gentle, and never judgmental. Prioritize safety.

AVAILABLE SERVICES:
${serviceContext}

KNOWLEDGE BASE:
${knowledgeContext}

${conversationContext ? `RECENT CONVERSATION:\n${conversationContext}` : ''}

Do NOT use emoji characters in your responses. Use plain text only.

EMERGENCY CONTACTS (reference these when users are in crisis):
- Kenya Police: 999 or 112
- Childline Kenya: 116
- GBV Hotline: 1195
- GVRC: 0709 319 000
- FIDA Kenya: 0722 509 760

Keep responses concise but caring. You are a rafiki wa kweli.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: sanitizedMessage }
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI service temporarily unavailable.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    const responseText = aiResult.choices?.[0]?.message?.content || '';

    if (!responseText) {
      throw new Error('No response from AI');
    }

    // Simple analysis without second AI call (cost saving for anonymous)
    const analysis = {
      intent: 'general_help',
      urgency: 'medium',
      emotional_state: 'neutral',
      services_needed: [] as string[],
      confidence: 0.6,
      requires_human: false,
      language_detected: language,
    };

    // Basic matching for services
    const matchedServices = services?.filter((service: any) => {
      const lowerMsg = sanitizedMessage.toLowerCase();
      return service.title.toLowerCase().split(' ').some((w: string) => lowerMsg.includes(w)) ||
             service.category.toLowerCase().split(' ').some((w: string) => lowerMsg.includes(w));
    }).slice(0, 2) || [];

    return new Response(JSON.stringify({
      response: responseText,
      analysis,
      matchedServices,
      conversationMetadata: {
        intent: analysis.intent,
        confidence: analysis.confidence,
        urgency: analysis.urgency,
        emotional_state: analysis.emotional_state,
        requires_human: analysis.requires_human,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('ai-chat-public error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process your message. Please try again.',
      request_id: crypto.randomUUID()
    }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
