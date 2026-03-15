import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as jose from 'https://deno.land/x/jose@v5.2.0/index.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const LTI_MESSAGE_TYPE = 'https://purl.imsglobal.org/spec/lti/claim/message_type';
const LTI_ROLES_CLAIM = 'https://purl.imsglobal.org/spec/lti/claim/roles';
const LTI_CONTEXT_CLAIM = 'https://purl.imsglobal.org/spec/lti/claim/context';
const LTI_RESOURCE_LINK_CLAIM = 'https://purl.imsglobal.org/spec/lti/claim/resource_link';
const LTI_AGS_CLAIM = 'https://purl.imsglobal.org/spec/lti-ags/claim/endpoint';
const LTI_DEPLOYMENT_ID_CLAIM = 'https://purl.imsglobal.org/spec/lti/claim/deployment_id';

const INSTRUCTOR_ROLES = [
  'http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor',
  'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Administrator',
  'http://purl.imsglobal.org/vocab/lis/v2/membership#ContentDeveloper',
  'http://purl.imsglobal.org/vocab/lis/v2/membership#Mentor',
];

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

    const body = await req.text();
    const params = Object.fromEntries(new URLSearchParams(body));
    const { id_token, state } = params;

    if (!id_token) {
      return new Response(JSON.stringify({ error: 'Missing id_token' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate state if present
    if (state) {
      const { data: session } = await supabase
        .from('lti_sessions')
        .select('*')
        .eq('state', state)
        .gte('expires_at', new Date().toISOString())
        .limit(1);

      if (!session || session.length === 0) {
        return new Response(JSON.stringify({ error: 'Invalid or expired state parameter' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Decode token header to get issuer without verification first
    const tokenParts = id_token.split('.');
    const payloadRaw = JSON.parse(atob(tokenParts[1].replace(/-/g, '+').replace(/_/g, '/')));
    const issuer = payloadRaw.iss;
    const aud = payloadRaw.aud;
    const clientId = Array.isArray(aud) ? aud[0] : aud;

    // Look up platform
    const { data: platforms } = await supabase
      .from('lti_platforms')
      .select('*')
      .eq('issuer', issuer)
      .eq('client_id', clientId)
      .eq('is_active', true)
      .limit(1);

    if (!platforms || platforms.length === 0) {
      return new Response(JSON.stringify({ error: 'Unregistered LTI platform' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const platform = platforms[0];

    // Fetch Moodle's JWKS and verify the token
    const JWKS = jose.createRemoteJWKSet(new URL(platform.jwks_url));
    
    let claims: jose.JWTPayload;
    try {
      const { payload } = await jose.jwtVerify(id_token, JWKS, {
        issuer: platform.issuer,
        audience: platform.client_id,
      });
      claims = payload;
    } catch (verifyError) {
      console.error('JWT verification failed:', verifyError);
      return new Response(JSON.stringify({ error: 'Invalid JWT signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check nonce for replay prevention
    const nonce = claims.nonce as string;
    if (nonce) {
      const { data: existingNonce } = await supabase
        .from('lti_nonces')
        .select('id')
        .eq('nonce', nonce)
        .eq('platform_id', platform.id)
        .limit(1);

      if (existingNonce && existingNonce.length > 0) {
        // Nonce was used in login, delete it to prevent replay
        await supabase
          .from('lti_nonces')
          .delete()
          .eq('nonce', nonce)
          .eq('platform_id', platform.id);
      }
    }

    // Extract LTI claims
    const ltiRoles = (claims[LTI_ROLES_CLAIM] as string[]) || [];
    const ltiContext = (claims[LTI_CONTEXT_CLAIM] as Record<string, any>) || {};
    const resourceLink = (claims[LTI_RESOURCE_LINK_CLAIM] as Record<string, any>) || {};
    const agsEndpoint = claims[LTI_AGS_CLAIM] as Record<string, any> | undefined;
    const deploymentId = claims[LTI_DEPLOYMENT_ID_CLAIM] as string;

    const userSub = claims.sub!;
    const userName = (claims.name as string) || 'Unknown';
    const userEmail = (claims.email as string) || `${userSub}@lti.local`;

    // Determine role
    const isInstructor = ltiRoles.some(role => INSTRUCTOR_ROLES.includes(role));
    const gloRole = isInstructor ? 'faculty' : 'student';

    // Get or create organization from course context
    const courseName = ltiContext.title || ltiContext.label || `LTI Course ${ltiContext.id || 'Unknown'}`;
    const courseId = ltiContext.id || 'default';

    let organizationId: string;

    // Check if org exists for this course
    const { data: existingOrgs } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', `lti-${platform.id}-${courseId}`)
      .limit(1);

    if (existingOrgs && existingOrgs.length > 0) {
      organizationId = existingOrgs[0].id;
    } else {
      // Create new org for this course
      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: courseName,
          slug: `lti-${platform.id}-${courseId}`,
          plan: 'education',
          is_active: true,
        })
        .select('id')
        .single();

      if (orgError || !newOrg) {
        console.error('Failed to create organization:', orgError);
        return new Response(JSON.stringify({ error: 'Failed to provision organization' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      organizationId = newOrg.id;
    }

    // Get or create active semester
    let semesterId: string;
    const { data: activeSemesters } = await supabase
      .from('edu_semesters')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .limit(1);

    if (activeSemesters && activeSemesters.length > 0) {
      semesterId = activeSemesters[0].id;
    } else {
      const now = new Date();
      const endDate = new Date(now.getFullYear(), now.getMonth() + 6, now.getDate());
      
      const { data: newSemester, error: semError } = await supabase
        .from('edu_semesters')
        .insert({
          name: `${now.getFullYear()} ${now.getMonth() < 6 ? 'Spring' : 'Fall'}`,
          organization_id: organizationId,
          start_date: now.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          is_active: true,
        })
        .select('id')
        .single();

      if (semError || !newSemester) {
        console.error('Failed to create semester:', semError);
        return new Response(JSON.stringify({ error: 'Failed to provision semester' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      semesterId = newSemester.id;
    }

    // Determine redirect based on role
    const appBaseUrl = Deno.env.get('APP_BASE_URL') || 'https://project-glo.lovable.app';
    let redirectPath: string;

    if (isInstructor) {
      // Ensure instructor is an org member
      const { data: existingMember } = await supabase
        .from('organization_members')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('user_id', userSub)
        .limit(1);

      if (!existingMember || existingMember.length === 0) {
        // We can't directly create org members without a real auth user
        // Store the mapping in the LTI session instead
        console.log('Instructor launch - no matching auth user for org membership:', userSub);
      }

      redirectPath = '/partner-portal';
    } else {
      // Student flow: check if student exists
      const { data: existingStudents } = await supabase
        .from('edu_students')
        .select('id, ethics_certified')
        .eq('student_id_external', userSub)
        .eq('organization_id', organizationId)
        .limit(1);

      if (existingStudents && existingStudents.length > 0) {
        // Returning student - update last_active
        const student = existingStudents[0];
        await supabase
          .from('edu_students')
          .update({ last_active_at: new Date().toISOString() })
          .eq('id', student.id);

        redirectPath = student.ethics_certified ? '/student-portal' : '/student-portal?ethics=required';
      } else {
        // New student - auto-provision
        const { data: newStudent, error: stuError } = await supabase
          .from('edu_students')
          .insert({
            name: userName,
            email: userEmail,
            student_id_external: userSub,
            organization_id: organizationId,
            semester_id: semesterId,
            status: 'active',
            ethics_certified: false,
            role: 'read_only',
          })
          .select('id')
          .single();

        if (stuError) {
          console.error('Failed to create student:', stuError);
          return new Response(JSON.stringify({ error: 'Failed to provision student' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        redirectPath = '/student-portal?ethics=required&welcome=true';
      }
    }

    // Store LTI session data
    await supabase.from('lti_sessions').upsert({
      platform_id: platform.id,
      lti_user_id: userSub,
      course_context: ltiContext,
      resource_link: resourceLink,
      ags_endpoint: agsEndpoint?.lineitem || agsEndpoint?.lineitems || null,
      roles: ltiRoles,
      state: state || crypto.randomUUID(),
    }, {
      onConflict: 'id',
    });

    // Redirect to the appropriate portal
    const redirectUrl = `${appBaseUrl}${redirectPath}`;

    return new Response(
      `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${redirectUrl}"></head><body>Redirecting to GLO...</body></html>`,
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html',
        },
      }
    );

  } catch (error) {
    console.error('LTI launch error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error during LTI launch' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
