
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface FollowUpAction {
  id: string;
  type: 'check_in' | 'appointment_reminder' | 'resource_suggestion' | 'emergency_check';
  message: string;
  scheduled_for: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  data?: any;
}

export const useProactiveFollowups = () => {
  const { user } = useAuth();
  const [pendingFollowups, setPendingFollowups] = useState<FollowUpAction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const scheduleFollowUp = async (
    type: FollowUpAction['type'],
    delayHours: number,
    message: string,
    priority: FollowUpAction['priority'] = 'medium',
    data?: any
  ) => {
    if (!user) return;

    try {
      const scheduledFor = new Date();
      scheduledFor.setHours(scheduledFor.getHours() + delayHours);

      const { data: followup, error } = await (supabase as any)
        .from('followup_actions')
        .insert({
          user_id: user.id,
          type,
          message,
          scheduled_for: scheduledFor.toISOString(),
          priority,
          data: data || {},
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      setPendingFollowups(prev => [...prev, followup as FollowUpAction]);
      return followup;
    } catch (error) {
      console.error('Error scheduling follow-up:', error);
      throw error;
    }
  };

  const getPendingFollowups = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await (supabase as any)
        .from('followup_actions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .lte('scheduled_for', new Date().toISOString())
        .order('priority', { ascending: false })
        .order('scheduled_for', { ascending: true });

      if (error) throw error;

      setPendingFollowups((data || []) as FollowUpAction[]);
      return data;
    } catch (error) {
      console.error('Error fetching follow-ups:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const markFollowUpCompleted = async (followUpId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('followup_actions')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', followUpId);

      if (error) throw error;

      setPendingFollowups(prev => prev.filter(f => f.id !== followUpId));
    } catch (error) {
      console.error('Error marking follow-up completed:', error);
      throw error;
    }
  };

  // Auto-schedule follow-ups based on conversation context
  const autoScheduleFollowUps = async (conversationContext: any) => {
    if (!user) return;

    try {
      // Emergency situation - schedule immediate check-in
      if (conversationContext.urgency === 'critical') {
        await scheduleFollowUp(
          'emergency_check',
          1,
          'Emergency follow-up: How are you doing? Do you still need immediate assistance?',
          'urgent',
          { original_context: conversationContext }
        );
      }

      // Service inquiry - schedule check-in after 24 hours
      if (conversationContext.matched_services?.length > 0) {
        await scheduleFollowUp(
          'check_in',
          24,
          'Hi! I wanted to follow up on the services we discussed. Were you able to get the help you needed?',
          'medium',
          { services: conversationContext.matched_services }
        );
      }

      // General support - schedule weekly check-in
      if (conversationContext.emotional_state === 'distressed') {
        await scheduleFollowUp(
          'check_in',
          168, // 7 days
          'Just checking in to see how you\'re doing. Is there anything else I can help you with?',
          'low'
        );
      }
    } catch (error) {
      console.error('Error auto-scheduling follow-ups:', error);
    }
  };

  useEffect(() => {
    if (user) {
      getPendingFollowups();
      
      // Set up periodic check for new follow-ups
      const interval = setInterval(getPendingFollowups, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [user]);

  return {
    pendingFollowups,
    scheduleFollowUp,
    getPendingFollowups,
    markFollowUpCompleted,
    autoScheduleFollowUps,
    isLoading
  };
};
