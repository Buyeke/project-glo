
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

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify JWT token with service role client
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !user) {
      console.log('Authentication failed:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check rate limit for authenticated user
    const clientIP = req.headers.get('cf-connecting-ip') || 
                    req.headers.get('x-forwarded-for')?.split(',')[0] || 
                    'unknown';

    const rateLimitResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/rate-limit-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({
        identifier: user.id,
        actionType: 'ai_chat',
        clientIP
      })
    });

    const rateLimitResult = await rateLimitResponse.json();
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          resetTime: rateLimitResult.resetTime 
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { message, conversationHistory, language = 'sheng', knowledgeContext = '' } = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

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

CRITICAL SHENG EXPRESSIONS TO RECOGNIZE:
- "nimebanwa" = I'm in a tough situation (URGENT)
- "kupigwa na msee" = I was abused (CRITICAL - legal/medical)
- "nimepotea" = I'm lost/have nowhere to go (URGENT - shelter)
- "nimechoka na life" = I'm tired of life (CRITICAL - suicide risk)
- "nataka kujitoa" = I'm thinking of ending my life (CRITICAL - suicide crisis)
- "nimefukuzwa" = I've been kicked out (URGENT - shelter)
- "niko kwa matope" = I'm in deep trouble (URGENT)
- "nimepigwa vibaya" = I was beaten badly (CRITICAL - medical/legal)
- "nataka kuhepa" = I want to run away from abuse (CRITICAL - safety)
- "nimefungiwa kwa room" = I've been locked in (CRITICAL - rescue needed)
- "niko kwa lockdown ya msee" = I'm being controlled/isolated (CRITICAL - safety)
- "sina mahali pa kulala" = I have nowhere to sleep (URGENT - shelter)
- "msee amenitishia" = Someone threatened me (HIGH - protection needed)
- "nimebebwa na police" = I was arrested (HIGH - legal aid)
- "niko na ball ya force" = I was forced into pregnancy (HIGH - medical/legal)
- "nataka safe house" = I want safe shelter (HIGH - shelter)
- "nimebebwa kwa nguvu" = I was assaulted (CRITICAL - trauma/legal)
- "niko na stress ya ball" = I'm stressed about pregnancy (HIGH - maternal health)
- "nimebeba ball" = I'm pregnant (MEDIUM - medical support)
- "mtoi hana chakula" = My child has no food (MEDIUM - food assistance)
- "sina diapers" = I don't have diapers (MEDIUM - baby supplies)
- "sina ID" = I don't have an ID (MEDIUM - documentation)
- "nataka job" = I'm looking for a job (MEDIUM - employment)
- "sina fare" = I don't have transport money (MEDIUM - financial)
- "niko down" = I'm feeling emotionally low (MEDIUM - emotional support)
- "niko na stress" = I'm stressed (MEDIUM - mental health)
- "sina doo" = I have no money (MEDIUM - financial)
- "nataka therapist" = I want a therapist (MEDIUM - mental health)
- "nataka lawyer" = I need a lawyer (MEDIUM - legal aid)
- "nimevunjika moyo" = I'm heartbroken (MEDIUM - emotional care)
- "naskia niko peke yangu" = I feel alone (MEDIUM - emotional support)
- "sina mtu wa kunisaidia" = I have no one to help me (MEDIUM - social support)
- "nimepoteza job" = I lost my job (MEDIUM - employment)
- "nimechanganyikiwa" = I'm confused (MEDIUM - guidance needed)
- "nataka kusaidiwa" = I want help (LOW - general support)

TRAUMA-INFORMED RESPONSE EXAMPLES:
If user says "nimebanwa": "Pole sana mresh. Naona uko kwa shida kubwa. Unaweza nipatia area uko? Nitakusaidia kupata msaada wa haraka. Haumo peke yako kwa hii."

If user says "kupigwa na msee": "Pole sana kwa hayo mambaya. Hii ni serious sana. Kuna advocates wa GBV tunaeza kuwasiliana nao. Unataka nikupe nambari ama nikuwekee? Uko safe hapa."

If user says "nimechoka na life": "Pole sana mresh. Naona uko kwa pain kubwa. Kuna counselors specialized na hii situation. Unataka niongelesha na mmoja sasa? Haumo peke yako."

If user says "sina mahali pa kulala": "Pole sana mresh. Unaweza nipatia area uko? Nitakusaidia kupata place safe haraka. Kuna safe houses za emergency tunaeza kufikia."

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
11. For CRITICAL situations (suicide, violence, abuse), provide immediate support
12. For HIGH situations (threats, forced pregnancy), prioritize safety
13. For MEDIUM situations (general needs), provide warm support
14. Always end with supportive validation

RESPONSE LANGUAGE:
- Default: Sheng (unless user requests English/Swahili)
- Tone: Warm, caring, trauma-informed
- Style: Like a "rafiki wa kweli, wa mtaa, mwenye roho safi"
- Speed: Never rush - "polepole" approach always

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

    // Enhanced classification with Sheng expressions
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
            content: `Analyze this message from a homeless woman or child in Kenya and return JSON with trauma-informed analysis. Pay special attention to Sheng expressions that indicate urgency:

CRITICAL SHENG EXPRESSIONS (urgency: "critical"):
- "nimebanwa", "kupigwa na msee", "nimechoka na life", "nataka kujitoa", "nimefukuzwa", "niko kwa matope", "nimepigwa vibaya", "nataka kuhepa", "nimefungiwa kwa room", "niko kwa lockdown ya msee", "sina mahali pa kulala", "nimebebwa kwa nguvu"

HIGH PRIORITY SHENG EXPRESSIONS (urgency: "high"):
- "msee amenitishia", "nimebebwa na police", "niko na ball ya force", "nataka safe house", "niko na stress ya ball", "mtoi wangu ameumwa"

MEDIUM PRIORITY SHENG EXPRESSIONS (urgency: "medium"):
- "nimebeba ball", "nataka job", "sina fare", "niko down", "niko na stress", "sina doo", "nataka therapist", "nataka lawyer"

Return JSON:
{
  "intent": "emergency|shelter|food|healthcare|mental_health|legal|gbv|safety_planning|job_training|court_support|general_help|greeting|thanks|followup_response|suicide_crisis|abuse_support|pregnancy_support|child_support|documentation|financial_aid",
  "urgency": "low|medium|high|critical",
  "emotional_state": "neutral|distressed|traumatized|grateful|angry|scared|hopeful|overwhelmed|suicidal|abused",
  "services_needed": ["array of relevant service types"],
  "confidence": 0.0-1.0,
  "requires_human": boolean,
  "trauma_indicators": boolean,
  "safety_concerns": boolean,
  "language_detected": "sheng|swahili|english|arabic",
  "follow_up_recommended": boolean,
  "knowledge_base_relevance": 0.0-1.0,
  "cultural_context": "street_life|domestic_violence|homelessness|vulnerability|empowerment|crisis|pregnancy|family_support",
  "sheng_expressions_detected": ["array of detected Sheng expressions"],
  "immediate_intervention_needed": boolean
}

Consider:
- Sheng expressions indicating crisis or trauma
- Need for immediate human intervention
- Cultural context of street life and homelessness
- Emotional state requiring extra care
- Whether proactive follow-up would be beneficial
- Specific Sheng phrases that indicate urgency levels`
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
        cultural_context: 'general',
        sheng_expressions_detected: [],
        immediate_intervention_needed: false
      };
    }

    // Find matching services based on enhanced AI analysis
    const matchedServices = services?.filter(service => {
      const serviceMatch = analysis.services_needed.some((need: string) => 
        service.category.toLowerCase().includes(need.toLowerCase()) ||
        service.title.toLowerCase().includes(need.toLowerCase()) ||
        service.description.toLowerCase().includes(need.toLowerCase())
      );
      
      const knowledgeMatch = knowledgeContext.toLowerCase().includes(service.title.toLowerCase());
      
      return serviceMatch || knowledgeMatch;
    }).slice(0, 3) || [];

    // Log interaction for security monitoring
    await supabase.from('security_logs').insert({
      event_type: 'ai_chat_interaction',
      user_id: user.id,
      event_data: {
        intent: analysis.intent,
        urgency: analysis.urgency,
        emotional_state: analysis.emotional_state,
        requires_human: analysis.requires_human,
        trauma_indicators: analysis.trauma_indicators,
        safety_concerns: analysis.safety_concerns
      },
      ip_address: clientIP
    });

    console.log('Enhanced Trauma-informed AI Analysis:', analysis);
    console.log('Matched Services:', matchedServices.length);
    console.log('User ID:', user.id);

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
        cultural_context: analysis.cultural_context,
        sheng_expressions_detected: analysis.sheng_expressions_detected,
        immediate_intervention_needed: analysis.immediate_intervention_needed
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in enhanced trauma-informed AI chat processor:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process message',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
