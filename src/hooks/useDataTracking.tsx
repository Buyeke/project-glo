import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface TrackingEvent {
  action_type: string;
  page_visited?: string;
  session_duration_minutes?: number;
  language_preference?: string;
  device_type?: string;
}

const getDeviceType = () => {
  const userAgent = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) return 'mobile';
  return 'desktop';
};

export const useDataTracking = () => {
  const { user } = useAuth();

  const trackEvent = async (event: TrackingEvent) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('usage_stats')
        .insert({
          user_id: user.id,
          action_type: event.action_type,
          page_visited: event.page_visited,
          session_duration_minutes: event.session_duration_minutes,
          language_preference: event.language_preference || 'english',
          device_type: event.device_type || getDeviceType(),
        });

      if (error) {
        console.error('Error tracking event:', error);
      }
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  };

  const trackServiceRequest = async (serviceType: string, language: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('service_requests_tracking')
        .insert({
          user_id: user.id,
          service_type: serviceType,
          language_used: language,
          status: 'submitted',
          priority: 'medium',
        })
        .select()
        .single();

      if (error) throw error;

      await trackEvent({
        action_type: 'service_request',
        page_visited: window.location.pathname,
      });

      return data;
    } catch (error) {
      console.error('Error tracking service request:', error);
      throw error;
    }
  };

  const submitFeedback = async (serviceRequestId: string, rating: number, comment?: string, anonymous?: boolean) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_feedback')
        .insert({
          user_id: user.id,
          service_request_id: serviceRequestId,
          rating,
          comment,
          anonymous: anonymous || false,
        })
        .select()
        .single();

      if (error) throw error;

      await trackEvent({
        action_type: 'feedback_given',
        page_visited: window.location.pathname,
      });

      return data;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  };

  const trackPageVisit = (pagePath: string) => {
    trackEvent({
      action_type: 'page_visit',
      page_visited: pagePath,
    });
  };

  return {
    trackEvent,
    trackServiceRequest,
    submitFeedback,
    trackPageVisit,
  };
};

// Page tracking hook
export const usePageTracking = () => {
  const { trackPageVisit } = useDataTracking();

  useEffect(() => {
    trackPageVisit(window.location.pathname);
  }, [window.location.pathname]);
};

// Session time tracking hook
export const useSessionTracking = () => {
  const { user } = useAuth();
  const sessionIdRef = useRef<string | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionStartRef = useRef<Date | null>(null);

  const updateSessionEnd = useCallback(async (sessionId: string) => {
    if (!sessionStartRef.current) return;
    const durationMinutes = (Date.now() - sessionStartRef.current.getTime()) / 60000;
    
    try {
      await supabase
        .from('user_sessions')
        .update({
          session_end: new Date().toISOString(),
          duration_minutes: Math.round(durationMinutes * 100) / 100,
        })
        .eq('id', sessionId);
    } catch (e) {
      console.error('Error updating session end:', e);
    }
  }, []);

  const sendBeaconUpdate = useCallback((sessionId: string) => {
    if (!sessionStartRef.current) return;
    const durationMinutes = (Date.now() - sessionStartRef.current.getTime()) / 60000;
    
    const url = `https://fznhhkxwzqipwfwihwqr.supabase.co/rest/v1/user_sessions?id=eq.${sessionId}`;
    const body = JSON.stringify({
      session_end: new Date().toISOString(),
      duration_minutes: Math.round(durationMinutes * 100) / 100,
    });

    const headers = {
      'Content-Type': 'application/json',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6bmhoa3h3enFpcHdmd2lod3FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NjM2MDYsImV4cCI6MjA2NTEzOTYwNn0.pf2kXjz8hnXbXpC-X3aEahv3ge-mAES0dVoMgeSrRAY',
      'Prefer': 'return=minimal',
    };

    // Try sendBeacon, fall back to sync update
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      // sendBeacon doesn't support custom headers well, so we fall back
      // Use fetch with keepalive instead
      try {
        fetch(url, {
          method: 'PATCH',
          headers,
          body,
          keepalive: true,
        });
      } catch {
        // Last resort - ignore
      }
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const startSession = async () => {
      const now = new Date();
      sessionStartRef.current = now;

      const { data, error } = await supabase
        .from('user_sessions')
        .insert({
          user_id: user.id,
          session_start: now.toISOString(),
          device_type: getDeviceType(),
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error starting session:', error);
        return;
      }

      sessionIdRef.current = data.id;

      // Heartbeat every 60 seconds
      heartbeatRef.current = setInterval(() => {
        if (sessionIdRef.current) {
          updateSessionEnd(sessionIdRef.current);
        }
      }, 60000);
    };

    startSession();

    const handleBeforeUnload = () => {
      if (sessionIdRef.current) {
        sendBeaconUpdate(sessionIdRef.current);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && sessionIdRef.current) {
        sendBeaconUpdate(sessionIdRef.current);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
      if (sessionIdRef.current) {
        updateSessionEnd(sessionIdRef.current);
      }
    };
  }, [user, updateSessionEnd, sendBeaconUpdate]);
};
