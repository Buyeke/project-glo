
import { applySecurityHeaders } from './enhancedSecurityHeaders';
import { sessionManager } from './enhancedSessionManager';
import { securityMonitor } from './enhancedSecurityMonitoring';

export const initializeSecurity = () => {
  // Apply security headers
  applySecurityHeaders();

  // Initialize session manager with admin-specific config
  sessionManager.initialize({
    maxIdleTime: 30 * 60 * 1000, // 30 minutes for admin users
    maxSessionTime: 4 * 60 * 60 * 1000, // 4 hours for admin sessions
    requireReauth: true
  });

  // Set up global error handling for security events
  window.addEventListener('error', (event) => {
    securityMonitor.logEnhancedSecurityEvent({
      eventType: 'suspicious_activity',
      severity: 'low',
      details: {
        type: 'javascript_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno
      }
    });
  });

  // Set up unhandled promise rejection handling
  window.addEventListener('unhandledrejection', (event) => {
    securityMonitor.logEnhancedSecurityEvent({
      eventType: 'suspicious_activity',
      severity: 'medium',
      details: {
        type: 'unhandled_promise_rejection',
        reason: event.reason?.toString()
      }
    });
  });

  console.log('Security system initialized successfully');
};

// Auto-initialize when imported
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSecurity);
  } else {
    initializeSecurity();
  }
}
