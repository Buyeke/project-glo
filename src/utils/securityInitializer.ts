
import { setSecurityHeaders, validateSecureContext } from './enhancedSecurityHeaders';
import { logSecurityEvent } from './securityLogger';

export const initializeSecurity = async () => {
  try {
    console.log('Initializing enhanced security measures...');

    // Set security headers
    setSecurityHeaders();

    // Validate secure context
    const isSecure = validateSecureContext();
    if (!isSecure) {
      await logSecurityEvent({
        event_type: 'suspicious_activity',
        event_data: {
          reason: 'Insecure context detected',
          protocol: window.location.protocol,
          host: window.location.host
        }
      });
    }

    // Log security initialization
    await logSecurityEvent({
      event_type: 'admin_access',
      event_data: {
        action: 'security_initialized',
        timestamp: new Date().toISOString()
      }
    });

    console.log('Security measures initialized successfully');
  } catch (error) {
    console.error('Security initialization failed:', error);
    
    await logSecurityEvent({
      event_type: 'suspicious_activity',
      event_data: {
        reason: 'Security initialization failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
};

// Initialize security when module loads
if (typeof window !== 'undefined') {
  initializeSecurity();
}
