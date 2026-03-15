import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as jose from 'https://deno.land/x/jose@v5.2.0/index.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { project_id, score, max_score = 100 } = await req.json();

    if (!project_id || score === undefined) {
      return new Response(JSON.stringify({ error: 'Missing project_id or score' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get project with student info
    const { data: project, error: projErr } = await supabase
      .from('edu_projects')
      .select('*, edu_students!inner(student_id_external, organization_id)')
      .eq('id', project_id)
      .single();

    if (projErr || !project) {
      return new Response(JSON.stringify({ error: 'Project not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const studentExtId = (project as any).edu_students.student_id_external;
    const orgId = (project as any).edu_students.organization_id;

    // Find the LTI session for this student to get AGS endpoint
    const { data: sessions } = await supabase
      .from('lti_sessions')
      .select('*, lti_platforms(*)')
      .eq('lti_user_id', studentExtId)
      .not('ags_endpoint', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!sessions || sessions.length === 0 || !sessions[0].ags_endpoint) {
      return new Response(JSON.stringify({ 
        error: 'No AGS endpoint found. Grade passback requires an active LTI session with AGS support.',
        grade_stored_locally: true 
      }), {
        status: 422,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const session = sessions[0];
    const platform = session.lti_platforms;
    const agsEndpoint = session.ags_endpoint;

    // Get OAuth2 access token from Moodle
    const privateKeyPem = Deno.env.get('LTI_RSA_PRIVATE_KEY');
    if (!privateKeyPem) {
      return new Response(JSON.stringify({ error: 'RSA private key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create client_credentials JWT for token request
    const pkcs8Key = await jose.importPKCS8(privateKeyPem, 'RS256');
    const now = Math.floor(Date.now() / 1000);
    
    const clientAssertion = await new jose.SignJWT({
      iss: platform.client_id,
      sub: platform.client_id,
      aud: platform.auth_token_url,
      iat: now,
      exp: now + 300,
      jti: crypto.randomUUID(),
    })
      .setProtectedHeader({ alg: 'RS256', kid: 'glo-lti-2026' })
      .sign(pkcs8Key);

    // Request access token
    const tokenResponse = await fetch(platform.auth_token_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        client_assertion: clientAssertion,
        scope: 'https://purl.imsglobal.org/spec/lti-ags/scope/score https://purl.imsglobal.org/spec/lti-ags/scope/lineitem',
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error('Token request failed:', tokenResponse.status, errText);
      return new Response(JSON.stringify({ error: 'Failed to get Moodle access token', details: errText }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Post score to Moodle AGS
    const scorePayload = {
      userId: studentExtId,
      scoreGiven: score,
      scoreMaximum: max_score,
      activityProgress: score > 0 ? 'Completed' : 'InProgress',
      gradingProgress: 'FullyGraded',
      timestamp: new Date().toISOString(),
    };

    // Determine the scores URL
    const scoresUrl = agsEndpoint.endsWith('/scores') 
      ? agsEndpoint 
      : `${agsEndpoint}/scores`;

    const gradeResponse = await fetch(scoresUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/vnd.ims.lis.v1.score+json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(scorePayload),
    });

    if (!gradeResponse.ok) {
      const errText = await gradeResponse.text();
      console.error('Grade passback failed:', gradeResponse.status, errText);
      return new Response(JSON.stringify({ 
        error: 'Grade passback to Moodle failed', 
        status: gradeResponse.status,
        details: errText 
      }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update project grade in GLO
    await supabase
      .from('edu_projects')
      .update({ 
        grade: String(score),
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', project_id);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Grade synced to Moodle gradebook',
      score,
      max_score,
      student_external_id: studentExtId,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('LTI grade passback error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error during grade passback' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
