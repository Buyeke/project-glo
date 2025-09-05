
// Enhanced security headers implementation with stricter CSP and comprehensive protection

export const setSecurityHeaders = () => {
  if (typeof document === 'undefined') return;
  
  // Remove any existing CSP meta tags to avoid conflicts
  const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (existingCSP) {
    existingCSP.remove();
  }

  // Create hardened Content Security Policy - removed unsafe-inline and unsafe-eval
  const cspContent = [
    "default-src 'self'",
    "script-src 'self' 'nonce-' https://js.paypal.com https://www.paypal.com https://www.sandbox.paypal.com https://apis.google.com",
    "style-src 'self' 'nonce-' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https://fznhhkxwzqipwfwihwqr.supabase.co",
    "media-src 'self' data: blob:",
    "connect-src 'self' https://fznhhkxwzqipwfwihwqr.supabase.co https://api.paypal.com https://api.sandbox.paypal.com https://www.paypal.com https://www.sandbox.paypal.com wss://fznhhkxwzqipwfwihwqr.supabase.co",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "worker-src 'self' blob:",
    "child-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://www.paypal.com https://www.sandbox.paypal.com",
    "upgrade-insecure-requests",
    "block-all-mixed-content"
  ].join('; ');

  // Set Content Security Policy
  const cspMeta = document.createElement('meta');
  cspMeta.httpEquiv = 'Content-Security-Policy';
  cspMeta.content = cspContent;
  document.head.appendChild(cspMeta);

  // Set additional security headers via meta tags
  const securityHeaders = [
    { httpEquiv: 'X-Content-Type-Options', content: 'nosniff' },
    { httpEquiv: 'X-Frame-Options', content: 'DENY' },
    { httpEquiv: 'X-XSS-Protection', content: '1; mode=block' },
    { httpEquiv: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' },
    { httpEquiv: 'Permissions-Policy', content: 'camera=(), microphone=(), geolocation=(), payment=()' }
  ];

  securityHeaders.forEach(header => {
    const meta = document.createElement('meta');
    meta.httpEquiv = header.httpEquiv;
    meta.content = header.content;
    document.head.appendChild(meta);
  });

  console.log('Enhanced security headers configured successfully');
};

export const validateSecureContext = (): boolean => {
  if (typeof window === 'undefined') return true;
  
  const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
  
  if (!isSecure) {
    console.warn('WARNING: Application is not running in a secure context (HTTPS)');
  }
  
  return isSecure;
};

// Initialize security headers when module loads
if (typeof window !== 'undefined') {
  setSecurityHeaders();
  validateSecureContext();
}
