import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Secure CORS configuration - only allow specific origins
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
    'Access-Control-Allow-Origin': isAllowed ? requestOrigin : allowedOrigins[3], // Default to projectglo.org
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
};

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Rate limiting check
  const clientIp = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const rateLimitKey = `donation_${clientIp}`;
  
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check rate limit - max 3 donation attempts per hour per IP
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const { data: recentAttempts } = await supabase
      .from('rate_limits')
      .select('attempt_count')
      .eq('identifier', rateLimitKey)
      .eq('action_type', 'donation')
      .gte('window_start', oneHourAgo.toISOString())
      .single();

    if (recentAttempts && recentAttempts.attempt_count >= 3) {
      console.log('Rate limit exceeded for donation attempts');
      return new Response(JSON.stringify({ error: 'Too many donation attempts. Please try again later.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Update rate limit counter
    await supabase
      .from('rate_limits')
      .upsert({
        identifier: rateLimitKey,
        action_type: 'donation',
        attempt_count: (recentAttempts?.attempt_count || 0) + 1,
        window_start: new Date().toISOString()
      });

  } catch (rateLimitError) {
    console.error('Rate limiting check failed:', rateLimitError);
    // Continue with request if rate limiting fails
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { 
      status: 405, 
      headers: corsHeaders 
    })
  }

  try {
    const { 
      amount, 
      currency = 'USD',
      description, 
      return_url, 
      cancel_url,
      donor_email,
      donor_name,
      message,
      anonymous = false
    } = await req.json();

    // Log without PII - only log sanitized data
    console.log('Processing donation payment:', { 
      amount, 
      currency, 
      donor_email_domain: donor_email ? donor_email.split('@')[1] : 'unknown',
      has_message: !!message,
      anonymous 
    });

    // Enhanced input validation
    if (!amount || amount <= 0 || amount > 100000) {
      return new Response(JSON.stringify({ error: 'Invalid amount (must be between $1 and $100,000)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!donor_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donor_email) || donor_email.length > 254) {
      return new Response(JSON.stringify({ error: 'Valid donor email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Sanitize inputs
    const sanitizedMessage = message ? message.replace(/<[^>]*>/g, '').substring(0, 500) : '';
    const sanitizedDonorName = donor_name ? donor_name.replace(/<[^>]*>/g, '').substring(0, 100) : '';

    // Get PayPal credentials
    const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID');
    const paypalClientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
    const paypalEnvironment = Deno.env.get('PAYPAL_ENVIRONMENT') || 'sandbox';

    if (!paypalClientId || !paypalClientSecret) {
      console.error('PayPal credentials not configured');
      return new Response(JSON.stringify({ error: 'PayPal credentials not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Set PayPal API URL based on environment
    const paypalApiUrl = paypalEnvironment === 'live' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com';

    console.log('Using PayPal environment:', paypalEnvironment);

    // Get PayPal access token
    const tokenResponse = await fetch(`${paypalApiUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${paypalClientId}:${paypalClientSecret}`)}`
      },
      body: 'grant_type=client_credentials'
    });

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text();
      console.error('PayPal token error:', tokenError);
      return new Response(JSON.stringify({ error: 'Failed to get PayPal access token' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Create donation record in database first using sanitized data
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: donation, error: donationError } = await supabaseService
      .from('donations')
      .insert({
        donor_name: anonymous ? null : sanitizedDonorName,
        donor_email,
        amount,
        currency,
        message: sanitizedMessage,
        anonymous,
        payment_method: 'paypal',
        status: 'pending'
      })
      .select()
      .single();

    if (donationError) {
      console.error('Failed to create donation record:', donationError);
      return new Response(JSON.stringify({ error: 'Failed to create donation record' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Created donation record with ID ending in:', donation.id.slice(-4));

    // Create PayPal payment
    const paymentData = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal'
      },
      transactions: [{
        amount: {
          total: amount.toString(),
          currency: currency
        },
        description: description || `Donation to Project GLO - $${amount} USD`,
        custom: donation.id // Store our donation ID in PayPal's custom field
      }],
      redirect_urls: {
        return_url: return_url || 'https://projectglo.org/donation-success',
        cancel_url: cancel_url || 'https://projectglo.org/donation-cancelled'
      }
    };

    console.log('Creating PayPal payment with data:', JSON.stringify(paymentData, null, 2));

    const paymentResponse = await fetch(`${paypalApiUrl}/v1/payments/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(paymentData)
    });

    if (!paymentResponse.ok) {
      const paymentError = await paymentResponse.json();
      console.error('PayPal payment creation failed:', paymentError);
      
      // Update donation status to failed
      await supabaseService
        .from('donations')
        .update({ status: 'failed' })
        .eq('id', donation.id);

      return new Response(JSON.stringify({ 
        error: 'Failed to create PayPal payment',
        details: paymentError 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const payment = await paymentResponse.json();
    console.log('PayPal payment created successfully with ID ending in:', payment.id.slice(-4));

    // Update donation record with PayPal payment ID
    await supabaseService
      .from('donations')
      .update({ payment_id: payment.id })
      .eq('id', donation.id);

    // Find approval URL
    const approvalUrl = payment.links.find((link: any) => link.rel === 'approval_url')?.href;

    if (!approvalUrl) {
      console.error('No approval URL found in PayPal response');
      return new Response(JSON.stringify({ error: 'PayPal approval URL not found' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Donation payment processed successfully');

    return new Response(JSON.stringify({
      payment_id: payment.id,
      donation_id: donation.id,
      approval_url: approvalUrl,
      status: 'created'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Donation payment processing error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})