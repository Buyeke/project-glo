
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory, language = 'english' } = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Get available services and intents for context
    const { data: services } = await supabase
      .from('services')
      .select('*')
      .eq('availability', 'Available');

    const { data: intents } = await supabase
      .from('chatbot_intents')
      .select('*');

    // Build context for OpenAI
    const serviceContext = services?.map(s => `${s.title}: ${s.description}`).join('\n') || '';
    const intentContext = intents?.map(i => `${i.intent_key}: ${i.response_template.english || i.response_template[Object.keys(i.response_template)[0]]}`).join('\n') || '';
    
    const conversationContext = conversationHistory?.slice(-5).map((msg: any) => 
      `${msg.isBot ? 'Assistant' : 'User'}: ${msg.text}`
    ).join('\n') || '';

    const systemPrompt = `You are Glo's AI assistant, helping women and children access support services. You are compassionate, professional, and culturally sensitive.

AVAILABLE SERVICES:
${serviceContext}

CONVERSATION CONTEXT:
${conversationContext}

RESPONSE GUIDELINES:
1. Be empathetic and supportive
2. Respond in ${language === 'english' ? 'English' : language === 'swahili' ? 'Swahili' : language === 'sheng' ? 'Sheng (Kenyan street language)' : 'Arabic'}
3. If someone needs emergency help, prioritize safety and immediate resources
4. Match services to user needs accurately
5. Ask clarifying questions when needed
6. Keep responses concise but helpful
7. Use cultural context appropriately for the language

CRITICAL: Always analyze the user's emotional state and respond appropriately. For distressed users, be extra supportive.`;

    // Call OpenAI for intelligent response generation
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const aiResult = await openAIResponse.json();
    
    if (!aiResult.choices?.[0]?.message?.content) {
      throw new Error('No response from OpenAI');
    }

    const aiResponse = aiResult.choices[0].message.content;

    // Use OpenAI to classify intent and extract key information
    const classificationResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Analyze this message and return JSON with:
{
  "intent": "emergency|shelter|food|healthcare|mental_health|legal|general_help|greeting|thanks",
  "urgency": "low|medium|high|critical",
  "emotional_state": "neutral|distressed|grateful|angry|scared",
  "services_needed": ["array of relevant service types"],
  "confidence": 0.0-1.0,
  "requires_human": boolean,
  "language_detected": "english|swahili|sheng|arabic"
}`
          },
          { role: 'user', content: message }
        ],
        temperature: 0.1,
      }),
    });

    const classificationResult = await classificationResponse.json();
    let analysis;
    
    try {
      analysis = JSON.parse(classificationResult.choices[0].message.content);
    } catch {
      analysis = {
        intent: 'general_help',
        urgency: 'medium',
        emotional_state: 'neutral',
        services_needed: [],
        confidence: 0.5,
        requires_human: false,
        language_detected: language
      };
    }

    // Find matching services based on AI analysis
    const matchedServices = services?.filter(service => 
      analysis.services_needed.some((need: string) => 
        service.category.toLowerCase().includes(need.toLowerCase()) ||
        service.title.toLowerCase().includes(need.toLowerCase())
      )
    ).slice(0, 3) || [];

    console.log('AI Analysis:', analysis);
    console.log('Matched Services:', matchedServices.length);

    return new Response(JSON.stringify({
      response: aiResponse,
      analysis,
      matchedServices,
      conversationMetadata: {
        intent: analysis.intent,
        confidence: analysis.confidence,
        urgency: analysis.urgency,
        emotional_state: analysis.emotional_state,
        requires_human: analysis.requires_human
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI chat processor:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process message',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
