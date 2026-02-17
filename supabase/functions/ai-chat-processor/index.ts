import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let user: any = null;
  let supabase: any = null;

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
    
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user: authUser }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !authUser) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    user = authUser;
    supabase = supabaseAuth;

    // Check rate limit
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
          message: rateLimitResult.message || 'Too many requests. Please try again later.',
          resetTime: rateLimitResult.resetTime 
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { message, conversationHistory, language = 'sheng', knowledgeContext = '' } = await req.json();
    
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Get available services and intents for context
    const { data: services } = await supabase
      .from('services')
      .select('*')
      .eq('availability', 'Available');

    const { data: intents } = await supabase
      .from('chatbot_intents')
      .select('*');

    const serviceContext = services?.map((s: any) => `${s.title}: ${s.description}`).join('\n') || '';
    const intentContext = intents?.map((i: any) => `${i.intent_key}: ${i.response_template.sheng || i.response_template.swahili || i.response_template.english}`).join('\n') || '';
    
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

AVAILABLE SERVICES:
${serviceContext}

KNOWLEDGE BASE CONTEXT:
${knowledgeContext}

CONVERSATION HISTORY:
${conversationContext}

TRAUMA-INFORMED RESPONSE GUIDELINES:
1. Always speak calmly and respectfully - like a caring big sister
2. Never rush the user or pressure them for information
3. Always offer choices
4. Validate their feelings: "Pole sana mresh"
5. Use authentic Sheng that respects street culture
6. Never judge or blame
7. Prioritize safety and well-being
8. For CRITICAL situations, provide immediate support
9. Always end with supportive validation

You are not just an AI — you are a rafiki wa kweli, wa mtaa, mwenye roho safi anataka kusaidia 🙏🏽💜`;

    // Call Lovable AI gateway
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: enhancedSystemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI service payment required. Please contact support.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errText);
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    
    if (!aiResult.choices?.[0]?.message?.content) {
      throw new Error('No response from AI gateway');
    }

    const responseText = aiResult.choices[0].message.content;
    const endTime = Date.now();
    const responseTimeMs = endTime - startTime;

    const promptTokens = aiResult.usage?.prompt_tokens || 0;
    const completionTokens = aiResult.usage?.completion_tokens || 0;
    const totalTokens = aiResult.usage?.total_tokens || 0;
    // Gemini pricing estimate
    const estimatedCost = (totalTokens / 1_000_000) * 0.10;

    // Insert performance metrics
    const { data: metricData, error: metricError } = await supabase
      .from('ai_model_metrics')
      .insert({
        user_id: user.id,
        model_name: 'google/gemini-3-flash-preview',
        request_timestamp: new Date(startTime).toISOString(),
        response_timestamp: new Date(endTime).toISOString(),
        response_time_ms: responseTimeMs,
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: totalTokens,
        estimated_cost_usd: estimatedCost,
        request_success: true,
        model_parameters: {
          temperature: 0.7,
          max_tokens: 600,
          model: 'google/gemini-3-flash-preview'
        }
      })
      .select()
      .single();

    let metricId: string | null = null;
    if (metricError) {
      console.error('Failed to insert AI metric:', metricError);
    } else {
      metricId = metricData?.id;
    }

    // Classification call
    const classificationResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: `Analyze this message from a homeless woman or child in Kenya and return JSON with trauma-informed analysis. Pay special attention to Sheng expressions that indicate urgency.

Return JSON only:
{
  "intent": "emergency|shelter|food|healthcare|mental_health|legal|gbv|safety_planning|job_training|general_help|greeting|thanks|suicide_crisis|abuse_support|pregnancy_support|child_support|documentation|financial_aid",
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
  "sheng_expressions_detected": [],
  "immediate_intervention_needed": boolean
}`
          },
          { role: 'user', content: `Message: "${message}"\nKnowledge Context: "${knowledgeContext}"` }
        ],
        temperature: 0.1,
      }),
    });

    let analysis;
    if (classificationResponse.ok) {
      const classificationResult = await classificationResponse.json();
      try {
        const content = classificationResult.choices?.[0]?.message?.content || '';
        // Strip markdown code fences if present
        const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        analysis = JSON.parse(jsonStr);
      } catch {
        analysis = getDefaultAnalysis(language);
      }
    } else {
      analysis = getDefaultAnalysis(language);
    }

    // Find matching services
    const matchedServices = services?.filter((service: any) => {
      const serviceMatch = analysis.services_needed.some((need: string) => 
        service.category.toLowerCase().includes(need.toLowerCase()) ||
        service.title.toLowerCase().includes(need.toLowerCase()) ||
        service.description.toLowerCase().includes(need.toLowerCase())
      );
      const knowledgeMatch = knowledgeContext.toLowerCase().includes(service.title.toLowerCase());
      return serviceMatch || knowledgeMatch;
    }).slice(0, 3) || [];

    // Log the interaction
    const { data: interactionData, error: logError } = await supabase
      .from('chat_interactions')
      .insert({
        user_id: user.id,
        original_message: message,
        response: responseText,
        detected_language: analysis.language_detected,
        matched_intent: analysis.intent,
        confidence_score: analysis.confidence,
        matched_service: matchedServices.length > 0 ? matchedServices[0].title : null,
        ai_model_metric_id: metricId,
        urgency_level: analysis.urgency,
        emotional_state: analysis.emotional_state,
        requires_human_intervention: analysis.requires_human,
        trauma_indicators_detected: analysis.trauma_indicators || analysis.urgency === 'critical',
        safety_concerns: analysis.safety_concerns || analysis.immediate_intervention_needed
      })
      .select()
      .single();

    if (logError) {
      console.error('Failed to log interaction:', logError);
    }

    // Security log
    await supabase.from('security_logs').insert({
      event_type: 'admin_access',
      user_id: user.id,
      event_data: {
        action: 'ai_chat_interaction',
        intent: analysis.intent,
        urgency: analysis.urgency,
        requires_human: analysis.requires_human,
        chat_interaction_id: interactionData?.id
      },
      ip_address: clientIP
    });

    console.log('AI interaction completed', {
      urgency_level: analysis.urgency,
      matched_services_count: matchedServices.length,
    });

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
    const endTime = Date.now();
    const responseTimeMs = endTime - startTime;
    console.error('AI chat processing failed:', error);
    
    const errorType = categorizeError(error);
    
    try {
      if (supabase) {
        await supabase
          .from('ai_model_metrics')
          .insert({
            user_id: user?.id,
            model_name: 'google/gemini-3-flash-preview',
            request_timestamp: new Date(startTime).toISOString(),
            response_timestamp: new Date(endTime).toISOString(),
            response_time_ms: responseTimeMs,
            request_success: false,
            error_type: errorType,
            error_message: error.message
          });
      }
    } catch (metricError) {
      console.error('Failed to log error metric:', metricError);
    }

    return new Response(
      JSON.stringify({ 
        error: 'Failed to process your message. Please try again.',
        request_id: crypto.randomUUID()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function getDefaultAnalysis(language: string) {
  return {
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

function categorizeError(error: any): string {
  const message = error.message?.toLowerCase() || '';
  if (message.includes('rate limit')) return 'rate_limit';
  if (message.includes('timeout')) return 'timeout';
  if (message.includes('authentication') || message.includes('unauthorized')) return 'auth_error';
  if (message.includes('invalid') || message.includes('bad request')) return 'invalid_request';
  if (message.includes('network')) return 'network_error';
  return 'unknown_error';
}
