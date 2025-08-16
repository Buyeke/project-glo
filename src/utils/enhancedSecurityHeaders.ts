
// Enhanced security headers for production security
export const getSecurityHeaders = () => {
  return {
    // Content Security Policy - prevents XSS attacks
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' https://js.supabase.co",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.ipify.org https://api.openai.com https://api.elevenlabs.io",
      "media-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests"
    ].join('; '),
    
    // Prevent clickjacking attacks
    'X-Frame-Options': 'SAMEORIGIN',
    
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // Enable XSS protection
    'X-XSS-Protection': '1; mode=block',
    
    // Referrer policy for privacy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permissions policy
    'Permissions-Policy': [
      'camera=()',
      'microphone=(self)',
      'geolocation=()',
      'interest-cohort=()',
      'payment=()',
      'usb=()'
    ].join(', '),
    
    // Strict transport security (HTTPS only)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  };
};

export const applySecurityHeaders = () => {
  if (typeof document !== 'undefined') {
    const headers = getSecurityHeaders();
    
    // Create meta tags for CSP if not already present
    if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      const cspMeta = document.createElement('meta');
      cspMeta.httpEquiv = 'Content-Security-Policy';
      cspMeta.content = headers['Content-Security-Policy'];
      document.head.appendChild(cspMeta);
    }
    
    // Log security headers application
    console.log('Enhanced security headers applied:', Object.keys(headers));
  }
};
