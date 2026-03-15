import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Parse form-encoded or query params from Moodle
    let params: Record<string, string> = {};
    if (req.method === 'POST') {
      const body = await req.text();
      params = Object.fromEntries(new URLSearchParams(body));
    } else {
      const url = new URL(req.url);
      params = Object.fromEntries(url.searchParams);
    }

    const { iss, login_hint, target_link_uri, lti_message_hint, client_id, lti_deployment_id } = params;

    if (!iss || !login_hint || !target_link_uri) {
      return new Response(JSON.stringify({ error: 'Missing required OIDC parameters: iss, login_hint, target_link_uri' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Look up registered platform
    let query = supabase
      .from('lti_platforms')
      .select('*')
      .eq('issuer', iss)
      .eq('is_active', true);

    if (client_id) {
      query = query.eq('client_id', client_id);
    }

    const { data: platforms, error: platformError } = await query.limit(1);

    if (platformError || !platforms || platforms.length === 0) {
      console.error('Unregistered platform:', iss, client_id);
      return new Response(JSON.stringify({ error: 'Unregistered LTI platform' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const platform = platforms[0];

    // Generate state and nonce for CSRF/replay protection
    const state = crypto.randomUUID();
    const nonce = crypto.randomUUID();

    // Store nonce for later validation
    await supabase.from('lti_nonces').insert({
      nonce,
      platform_id: platform.id,
    });

    // Store state in lti_sessions for later validation
    await supabase.from('lti_sessions').insert({
      platform_id: platform.id,
      lti_user_id: login_hint,
      state,
      course_context: { target_link_uri },
    });

    // Build OIDC auth redirect URL
    const authParams = new URLSearchParams({
      scope: 'openid',
      response_type: 'id_token',
      response_mode: 'form_post',
      prompt: 'none',
      client_id: platform.client_id,
      redirect_uri: target_link_uri,
      login_hint,
      state,
      nonce,
    });

    if (lti_message_hint) {
      authParams.set('lti_message_hint', lti_message_hint);
    }

    const redirectUrl = `${platform.auth_login_url}?${authParams.toString()}`;

    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': redirectUrl,
      },
    });

  } catch (error) {
    console.error('LTI login error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error during LTI login' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
