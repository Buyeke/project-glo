
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

serve(async (req) => {
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

    console.log('Client IP detection:', {
      forwardedFor,
      realIp,
      cfConnectingIp,
      resolvedIp: clientIp
    });

    return new Response(
      JSON.stringify({ 
        ip: clientIp,
        headers: {
          'x-forwarded-for': forwardedFor,
          'x-real-ip': realIp,
          'cf-connecting-ip': cfConnectingIp
        }
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
