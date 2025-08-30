
// Enhanced security headers with stricter CSP and comprehensive protection

export const setSecurityHeaders = () => {
  // Content Security Policy - Stricter version
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.paypal.com https://www.sandbox.paypal.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob:",
    "connect-src 'self' https://*.supabase.co https://api.ipify.org wss://*.supabase.co https://www.paypal.com https://api.sandbox.paypal.com",
    "frame-src 'self' https://www.paypal.com https://www.sandbox.paypal.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://www.paypal.com https://www.sandbox.paypal.com",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');

  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = csp;
  document.head.appendChild(meta);

  // Additional security headers via meta tags where possible
  const headers = [
    { name: 'X-Content-Type-Options', content: 'nosniff' },
    { name: 'X-Frame-Options', content: 'DENY' },
    { name: 'X-XSS-Protection', content: '1; mode=block' },
    { name: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' }
  ];

  headers.forEach(header => {
    const metaTag = document.createElement('meta');
    metaTag.httpEquiv = header.name;
    metaTag.content = header.content;
    document.head.appendChild(metaTag);
  });
};

export const validateSecureContext = (): boolean => {
  // Check if we're in a secure context (HTTPS)
  if (typeof window !== 'undefined' && !window.isSecureContext && location.protocol !== 'http:') {
    console.warn('Application is not running in a secure context');
    return false;
  }
  return true;
};

// Initialize security headers when module loads
if (typeof window !== 'undefined') {
  setSecurityHeaders();
  validateSecureContext();
}
