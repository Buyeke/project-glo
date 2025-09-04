
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Secure CORS configuration - restrict to known origins
const getAllowedOrigins = () => [
  'https://fznhhkxwzqipwfwihwqr.supabase.co',
  'http://localhost:3000',
  'https://lovable.dev',
  'https://projectglo.org',
  'https://www.projectglo.org'
];

const getCorsHeaders = (origin?: string) => {
  const allowedOrigins = getAllowedOrigins();
  const requestOrigin = origin || '';
  const isAllowed = allowedOrigins.includes(requestOrigin);
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? requestOrigin : allowedOrigins[3],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };
};

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP from various headers
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const cfConnectingIp = req.headers.get('cf-connecting-ip');
    
    let clientIp = 'unknown';
    
    if (forwardedFor) {
      // x-forwarded-for can contain multiple IPs, the first one is the original client
      clientIp = forwardedFor.split(',')[0].trim();
    } else if (realIp) {
      clientIp = realIp;
    } else if (cfConnectingIp) {
      clientIp = cfConnectingIp;
    }

    // Create a simple hash of the IP for privacy (first 8 chars of hash)
    const encoder = new TextEncoder();
    const data = encoder.encode(clientIp);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const ipHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 8);

    // Only log anonymized data
    console.log('Client IP detection (anonymized):', {
      hasForwardedFor: !!forwardedFor,
      hasRealIp: !!realIp,
      hasCfConnectingIp: !!cfConnectingIp,
      ipHash: ipHash
    });

    return new Response(
      JSON.stringify({ 
        ip: clientIp,
        // Don't expose all headers for privacy
        source: cfConnectingIp ? 'cloudflare' : forwardedFor ? 'forwarded' : realIp ? 'real-ip' : 'unknown'
      }),
      {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error getting client IP:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to get client IP',
        ip: 'unknown'
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
