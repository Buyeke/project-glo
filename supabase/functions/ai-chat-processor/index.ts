
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
    const { message, conversationHistory, language = 'sheng', knowledgeContext = '' } = await req.json();
    
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

    // Build enhanced context for OpenAI
    const serviceContext = services?.map(s => `${s.title}: ${s.description}`).join('\n') || '';
    const intentContext = intents?.map(i => `${i.intent_key}: ${i.response_template.sheng || i.response_template.swahili || i.response_template.english}`).join('\n') || '';
    
    const conversationContext = conversationHistory?.slice(-5).map((msg: any) => 
      `${msg.isBot ? 'GLO' : 'Mresh'}: ${msg.text}`
    ).join('\n') || '';

    const enhancedSystemPrompt = `You are GLO, a trauma-informed, caring AI assistant who speaks in Sheng, Swahili, and English. You support homeless women and children in Kenya by helping them find shelter, mental health support, legal aid, and job opportunities.

You must always speak calmly, respectfully, and never rush the user. Let them speak in their own words — especially in Sheng or Swahili — and never judge them. Always offer choices before collecting sensitive information.

Respond in Sheng by default, unless the user asks for English or Swahili. Keep your tone warm and gentle — like a big sister who understands street life and is here to help.

AVAILABLE SERVICES:
${serviceContext}

KNOWLEDGE BASE CONTEXT:
${knowledgeContext}

CONVERSATION HISTORY:
${conversationContext}

TRAUMA-INFORMED RESPONSE GUIDELINES:
1. Always speak calmly and respectfully - like a caring big sister
2. Never rush the user or pressure them for information
3. Always offer choices: "Unataka niongelesha nini? Shelter, mental health, legal aid, ama job opportunities?"
4. Validate their feelings: "Pole sana mresh" when they share difficulties
5. Use authentic Sheng that respects street culture
6. Never judge or blame - always show understanding
7. Prioritize safety and well-being in all responses
8. Let them know they can pause or stop anytime
9. Be sensitive to trauma indicators and respond appropriately
10. Always offer multiple options rather than directing single actions

RESPONSE LANGUAGE:
- Default: Sheng (unless user requests English/Swahili)
- Tone: Warm, caring, trauma-informed
- Style: Like a "rafiki wa kweli, wa mtaa, mwenye roho safi"
- Speed: Never rush - "polepole" approach always

EXAMPLE RESPONSES:
If user says "Niko na shida ya makao":
"Pole sana mresh. Unaweza nipatia area uko? Nitakusaidia kupata place safe haraka."

If user says "Nimepigwa na nataka lawyer":
"Pole sana kwa hayo mambaya. Kuna advocates wa GBV tunaeza kuwasiliana nao. Unataka nikupe nambari ama nikuwekee?"

You can assist with:
- Finding verified safe shelters
- Booking mental health sessions with certified therapists  
- Connecting users with legal aid (especially for GBV)
- Showing job leads from inclusive employers
- Sharing safety tips, hygiene info, and emergency numbers

CRITICAL: Always prioritize user safety and well-being. If someone is in immediate danger, provide emergency resources immediately while being trauma-informed.

You are not just an AI — you are a rafiki wa kweli, wa mtaa, mwenye roho safi anataka kusaidia 🙏🏽💜`;

    // Call OpenAI for intelligent response generation with enhanced context
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: enhancedSystemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    const aiResult = await openAIResponse.json();
    
    if (!aiResult.choices?.[0]?.message?.content) {
      throw new Error('No response from OpenAI');
    }

    const aiResponse = aiResult.choices[0].message.content;

    // Use OpenAI to classify intent and extract key information with trauma-informed analysis
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
            content: `Analyze this message from a homeless woman or child in Kenya and return JSON with trauma-informed analysis:
{
  "intent": "emergency|shelter|food|healthcare|mental_health|legal|gbv|safety_planning|job_training|court_support|general_help|greeting|thanks|followup_response",
  "urgency": "low|medium|high|critical",
  "emotional_state": "neutral|distressed|traumatized|grateful|angry|scared|hopeful|overwhelmed",
  "services_needed": ["array of relevant service types"],
  "confidence": 0.0-1.0,
  "requires_human": boolean,
  "trauma_indicators": boolean,
  "safety_concerns": boolean,
  "language_detected": "sheng|swahili|english|arabic",
  "follow_up_recommended": boolean,
  "knowledge_base_relevance": 0.0-1.0,
  "cultural_context": "street_life|domestic_violence|homelessness|vulnerability|empowerment"
}

Consider:
- Trauma indicators and safety concerns
- Need for immediate human intervention
- Cultural context of street life and homelessness
- Emotional state requiring extra care
- Whether proactive follow-up would be beneficial`
          },
          { role: 'user', content: `Message: "${message}"\nKnowledge Context: "${knowledgeContext}"` }
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
        trauma_indicators: false,
        safety_concerns: false,
        language_detected: language,
        follow_up_recommended: false,
        knowledge_base_relevance: 0.0,
        cultural_context: 'general'
      };
    }

    // Find matching services based on AI analysis with trauma-informed matching
    const matchedServices = services?.filter(service => {
      const serviceMatch = analysis.services_needed.some((need: string) => 
        service.category.toLowerCase().includes(need.toLowerCase()) ||
        service.title.toLowerCase().includes(need.toLowerCase()) ||
        service.description.toLowerCase().includes(need.toLowerCase())
      );
      
      // Also check if the service is mentioned in knowledge context
      const knowledgeMatch = knowledgeContext.toLowerCase().includes(service.title.toLowerCase());
      
      return serviceMatch || knowledgeMatch;
    }).slice(0, 3) || [];

    console.log('Trauma-informed AI Analysis:', analysis);
    console.log('Matched Services:', matchedServices.length);
    console.log('Trauma Indicators:', analysis.trauma_indicators);
    console.log('Safety Concerns:', analysis.safety_concerns);

    return new Response(JSON.stringify({
      response: aiResponse,
      analysis,
      matchedServices,
      conversationMetadata: {
        intent: analysis.intent,
        confidence: analysis.confidence,
        urgency: analysis.urgency,
        emotional_state: analysis.emotional_state,
        requires_human: analysis.requires_human,
        trauma_indicators: analysis.trauma_indicators,
        safety_concerns: analysis.safety_concerns,
        follow_up_recommended: analysis.follow_up_recommended,
        knowledge_base_used: analysis.knowledge_base_relevance > 0.5,
        cultural_context: analysis.cultural_context
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in trauma-informed AI chat processor:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process message',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
