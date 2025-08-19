
// Centralized CORS configuration for consistent security across edge functions
export const getAllowedOrigins = () => {
  return [
    'https://fznhhkxwzqipwfwihwqr.supabase.co',
    'http://localhost:3000',
    'https://lovable.dev',
    // Add production domain when deployed
    // 'https://yourproductiondomain.com'
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
