
import { supabase } from '@/integrations/supabase/client';

export type SecurityEventType = 
  | 'login_attempt'
  | 'login_success'
  | 'login_failure'
  | 'admin_access'
  | 'contact_submission'
  | 'rate_limit_exceeded'
  | 'suspicious_activity'
  | 'unauthorized_access';

export interface SecurityEvent {
  event_type: SecurityEventType;
  user_id?: string;
  event_data?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export const logSecurityEvent = async (event: SecurityEvent) => {
  try {
    const { error } = await supabase
      .from('security_logs')
      .insert({
        event_type: event.event_type,
        user_id: event.user_id,
        event_data: event.event_data,
        ip_address: event.ip_address,
        user_agent: event.user_agent || navigator.userAgent
      });

    if (error) {
      console.error('Failed to log security event:', error);
    }
  } catch (error) {
    console.error('Error logging security event:', error);
  }
};

export const getClientIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'unknown';
  } catch (error) {
    console.error('Failed to get client IP:', error);
    return 'unknown';
  }
};
