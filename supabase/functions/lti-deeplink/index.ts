import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as jose from 'https://deno.land/x/jose@v5.2.0/index.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

const LTI_DL_CLAIM = 'https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const url = new URL(req.url);

    // If POST with id_token, this is the initial deep link launch from Moodle
    if (req.method === 'POST') {
      const body = await req.text();
      const params = Object.fromEntries(new URLSearchParams(body));
      const { id_token } = params;

      if (!id_token) {
        return new Response(JSON.stringify({ error: 'Missing id_token' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Decode to get platform info
      const tokenParts = id_token.split('.');
      const payload = JSON.parse(atob(tokenParts[1].replace(/-/g, '+').replace(/_/g, '/')));
      const issuer = payload.iss;
      const clientId = Array.isArray(payload.aud) ? payload.aud[0] : payload.aud;

      // Verify platform
      const { data: platforms } = await supabase
        .from('lti_platforms')
        .select('*')
        .eq('issuer', issuer)
        .eq('client_id', clientId)
        .eq('is_active', true)
        .limit(1);

      if (!platforms || platforms.length === 0) {
        return new Response(JSON.stringify({ error: 'Unregistered platform' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const platform = platforms[0];

      // Verify JWT
      const JWKS = jose.createRemoteJWKSet(new URL(platform.jwks_url));
      const { payload: claims } = await jose.jwtVerify(id_token, JWKS, {
        issuer: platform.issuer,
        audience: platform.client_id,
      });

      const dlSettings = claims[LTI_DL_CLAIM] as Record<string, any>;
      if (!dlSettings) {
        return new Response(JSON.stringify({ error: 'Not a deep linking request' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get course context to find org
      const context = claims['https://purl.imsglobal.org/spec/lti/claim/context'] as Record<string, any> || {};
      const courseId = context.id || 'default';
      const orgSlug = `lti-${platform.id}-${courseId}`;

      // Look up assignments for this organization
      const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', orgSlug)
        .limit(1)
        .single();

      let assignments: any[] = [];
      if (org) {
        const { data } = await supabase
          .from('edu_assignments')
          .select('id, title, description, difficulty, deadline')
          .eq('organization_id', org.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        assignments = data || [];
      }

      // Render assignment selection UI
      const assignmentOptions = assignments.map(a => `
        <div style="border:1px solid #ddd;padding:16px;margin:8px 0;border-radius:8px;cursor:pointer;" 
             onclick="selectAssignment('${a.id}', '${a.title.replace(/'/g, "\\'")}')">
          <h3 style="margin:0 0 4px 0;">${a.title}</h3>
          <p style="margin:0;color:#666;font-size:14px;">${a.description || 'No description'}</p>
          <span style="font-size:12px;color:#888;">Difficulty: ${a.difficulty}${a.deadline ? ' | Due: ' + new Date(a.deadline).toLocaleDateString() : ''}</span>
        </div>
      `).join('');

      const html = `<!DOCTYPE html>
<html>
<head>
  <title>Select GLO Assignment</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 600px; margin: 40px auto; padding: 0 20px; }
    h1 { color: #1a1a1a; }
    .no-assignments { padding: 40px; text-align: center; color: #666; }
    button { background: #2563eb; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px; }
    button:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <h1>🎓 Select GLO Assignment</h1>
  <p>Choose an assignment to embed in your Moodle course:</p>
  ${assignments.length > 0 ? assignmentOptions : '<div class="no-assignments">No active assignments found. Create assignments in the GLO Partner Portal first.</div>'}
  
  <form id="dl-form" method="POST" action="${dlSettings.deep_link_return_url}" style="display:none;">
    <input type="hidden" name="JWT" id="dl-jwt" />
  </form>

  <script>
    async function selectAssignment(id, title) {
      // Call our backend to generate the deep link response JWT
      const resp = await fetch('${url.origin}${url.pathname}?action=respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignment_id: id,
          assignment_title: title,
          platform_id: '${platform.id}',
          return_url: '${dlSettings.deep_link_return_url}',
          deployment_id: '${claims['https://purl.imsglobal.org/spec/lti/claim/deployment_id'] || ''}',
        })
      });
      const data = await resp.json();
      if (data.jwt) {
        document.getElementById('dl-jwt').value = data.jwt;
        document.getElementById('dl-form').submit();
      } else {
        alert('Error creating deep link: ' + (data.error || 'Unknown'));
      }
    }
  </script>
</body>
</html>`;

      return new Response(html, {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'text/html' },
      });
    }

    // GET with action=respond: generate deep link response JWT
    if (req.method === 'POST' && url.searchParams.get('action') === 'respond') {
      // This won't be reached since we already handle POST above
    }

    // Handle the respond action via POST with JSON body
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const { assignment_id, assignment_title, platform_id, return_url, deployment_id } = await req.json();

      const privateKeyPem = Deno.env.get('LTI_RSA_PRIVATE_KEY');
      if (!privateKeyPem) {
        return new Response(JSON.stringify({ error: 'RSA private key not configured' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get platform for issuer info
      const { data: platform } = await supabase
        .from('lti_platforms')
        .select('*')
        .eq('id', platform_id)
        .single();

      if (!platform) {
        return new Response(JSON.stringify({ error: 'Platform not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Import RSA private key
      const pemClean = privateKeyPem
        .replace(/-----BEGIN PRIVATE KEY-----/, '')
        .replace(/-----END PRIVATE KEY-----/, '')
        .replace(/-----BEGIN RSA PRIVATE KEY-----/, '')
        .replace(/-----END RSA PRIVATE KEY-----/, '')
        .replace(/\s/g, '');

      const binaryKey = Uint8Array.from(atob(pemClean), c => c.charCodeAt(0));
      const privateKey = await crypto.subtle.importKey(
        'pkcs8',
        binaryKey,
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const launchUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/lti-launch`;

      // Build deep linking response JWT
      const now = Math.floor(Date.now() / 1000);
      const jwtPayload = {
        iss: platform.client_id,
        aud: platform.issuer,
        iat: now,
        exp: now + 300,
        nonce: crypto.randomUUID(),
        'https://purl.imsglobal.org/spec/lti/claim/message_type': 'LtiDeepLinkingResponse',
        'https://purl.imsglobal.org/spec/lti/claim/version': '1.3.0',
        'https://purl.imsglobal.org/spec/lti/claim/deployment_id': deployment_id,
        'https://purl.imsglobal.org/spec/lti-dl/claim/content_items': [
          {
            type: 'ltiResourceLink',
            title: assignment_title,
            url: launchUrl,
            custom: {
              assignment_id: assignment_id,
            },
          },
        ],
      };

      // Sign JWT using jose
      const pkcs8Key = await jose.importPKCS8(privateKeyPem, 'RS256');
      const jwt = await new jose.SignJWT(jwtPayload)
        .setProtectedHeader({ alg: 'RS256', kid: 'glo-lti-2026' })
        .sign(pkcs8Key);

      return new Response(JSON.stringify({ jwt }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Bad request', { status: 400, headers: corsHeaders });

  } catch (error) {
    console.error('LTI deep link error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
