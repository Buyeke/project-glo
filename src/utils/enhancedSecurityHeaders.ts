
// Enhanced security headers for production security
export const getSecurityHeaders = () => {
  const isProduction = window.location.hostname !== 'localhost' && 
                      !window.location.hostname.includes('lovable.dev');
  
  const headers: Record<string, string> = {
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // Enable XSS protection
    'X-XSS-Protection': '1; mode=block',
    
    // Referrer policy for privacy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permissions policy - restrict dangerous features
    'Permissions-Policy': [
      'camera=()',
      'microphone=(self)',
      'geolocation=()',
      'interest-cohort=()',
      'payment=()',
      'usb=()',
      'battery=()',
      'accelerometer=()',
      'gyroscope=()'
    ].join(', ')
  };

  // Only apply strict frame and CSP policies in production
  if (isProduction) {
    // Prevent clickjacking attacks in production
    headers['X-Frame-Options'] = 'SAMEORIGIN';
    
    // Content Security Policy - prevents XSS attacks
    headers['Content-Security-Policy'] = [
      "default-src 'self'",
      "script-src 'self' https://js.supabase.co",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.ipify.org https://api.openai.com https://api.elevenlabs.io",
      "media-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests"
    ].join('; ');
    
    // Strict transport security (HTTPS only) in production
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
  }
  
  return headers;
};

export const applySecurityHeaders = () => {
  if (typeof document !== 'undefined') {
    const headers = getSecurityHeaders();
    
    // Create meta tags for applicable headers
    Object.entries(headers).forEach(([name, content]) => {
      if (name === 'Content-Security-Policy') {
        // Only apply CSP in production to avoid breaking Lovable editor
        const isProduction = window.location.hostname !== 'localhost' && 
                            !window.location.hostname.includes('lovable.dev');
        
        if (isProduction && !document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
          const cspMeta = document.createElement('meta');
          cspMeta.httpEquiv = 'Content-Security-Policy';
          cspMeta.content = content;
          document.head.appendChild(cspMeta);
        }
      }
    });
    
    console.log('Security headers configured for environment:', {
      production: window.location.hostname !== 'localhost' && !window.location.hostname.includes('lovable.dev'),
      headers: Object.keys(headers)
    });
  }
};
