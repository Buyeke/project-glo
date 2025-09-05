
// Centralized CORS configuration for consistent security across edge functions
export const getAllowedOrigins = () => {
  return [
    'https://fznhhkxwzqipwfwihwqr.supabase.co',
    'http://localhost:3000',
    'https://lovable.dev',
    'https://6f4bde81-af49-46b2-9d04-1ec7163a4a1b.sandbox.lovable.dev', // Current Lovable preview domain
    'https://projectglo.org',
    'https://www.projectglo.org'
  ];
};

export const getCorsHeaders = (origin?: string) => {
  const allowedOrigins = getAllowedOrigins();
  const requestOrigin = origin || '*';
  
  // Check if the origin is allowed
  const isAllowed = allowedOrigins.includes(requestOrigin) || requestOrigin === '*';
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? requestOrigin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  };
};
