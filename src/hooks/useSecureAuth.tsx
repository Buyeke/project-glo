
import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { SessionManager } from '@/utils/sessionManager';
import { logSecurityEvent } from '@/utils/securityLogger';

export const useSecureAuth = () => {
  const { user, session } = useAuth();

  useEffect(() => {
    if (session) {
      SessionManager.startSessionMonitoring();
      
      // Log successful authentication
      logSecurityEvent({
        event_type: 'login_success',
        user_id: user?.id,
        event_data: { timestamp: new Date().toISOString() }
      });
    } else {
      SessionManager.stopSessionMonitoring();
    }

    return () => {
      SessionManager.stopSessionMonitoring();
    };
  }, [session, user]);

  return { user, session };
};
