
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface TrackingEvent {
  action_type: string;
  page_visited?: string;
  session_duration_minutes?: number;
  language_preference?: string;
  device_type?: string;
}

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

      // Also track as usage stat
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

      // Track feedback event
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

  const getDeviceType = () => {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) return 'mobile';
    return 'desktop';
  };

  // Track page visits
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
