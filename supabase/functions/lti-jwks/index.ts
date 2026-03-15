const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const publicKeyPem = Deno.env.get('LTI_RSA_PUBLIC_KEY');

    if (!publicKeyPem) {
      console.error('LTI_RSA_PUBLIC_KEY not configured');
      return new Response(JSON.stringify({ error: 'JWKS not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse PEM to extract RSA components
    const pemClean = publicKeyPem
      .replace(/-----BEGIN PUBLIC KEY-----/, '')
      .replace(/-----END PUBLIC KEY-----/, '')
      .replace(/\s/g, '');

    const binaryKey = Uint8Array.from(atob(pemClean), c => c.charCodeAt(0));

    // Import the public key
    const cryptoKey = await crypto.subtle.importKey(
      'spki',
      binaryKey,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      true,
      ['verify']
    );

    // Export as JWK
    const jwk = await crypto.subtle.exportKey('jwk', cryptoKey);

    const jwks = {
      keys: [
        {
          kty: jwk.kty,
          kid: 'glo-lti-2026',
          use: 'sig',
          alg: 'RS256',
          n: jwk.n,
          e: jwk.e,
        },
      ],
    };

    return new Response(JSON.stringify(jwks), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (error) {
    console.error('JWKS error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate JWKS' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
