
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { UserAssessment, ServiceProvider } from '@/types/matching';
import { detectEmergency } from '@/utils/emergencyDetection';
import { findBestMatches } from '@/utils/matchingAlgorithm';
import { toast } from 'sonner';

export const useAssessment = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentAssessment, setCurrentAssessment] = useState<Partial<UserAssessment> | null>(null);

  // Get user's assessment history
  const { data: assessments = [], isLoading: isLoadingAssessments } = useQuery({
    queryKey: ['user-assessments', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as UserAssessment[];
    },
    enabled: !!user,
  });

  // Get service providers for matching
  const { data: providers = [] } = useQuery({
    queryKey: ['service-providers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('verification_status', 'verified')
        .eq('is_active', true);
      
      if (error) throw error;
      // Cast the Supabase types to our ServiceProvider interface
      return data.map(provider => ({
        ...provider,
        location_data: provider.location_data as ServiceProvider['location_data'],
        contact_info: provider.contact_info as ServiceProvider['contact_info'],
        capacity_info: provider.capacity_info as ServiceProvider['capacity_info'],
        operating_hours: provider.operating_hours as ServiceProvider['operating_hours']
      })) as ServiceProvider[];
    },
  });

  // Create new assessment
  const createAssessmentMutation = useMutation({
    mutationFn: async (assessmentData: {
      need_types: string[];
      urgency_level: 'high' | 'medium' | 'low';
      language_preference: string;
      location_data?: any;
      vulnerability_tags?: string[];
      literacy_mode?: 'text' | 'voice_first' | 'icon_based';
      assessment_responses: Record<string, any>;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const assessmentCount = assessments.length + 1;
      const isEmergency = detectEmergency(assessmentData.assessment_responses);

      const newAssessment = {
        user_id: user.id,
        assessment_number: assessmentCount,
        is_emergency: isEmergency,
        ...assessmentData,
      };

      const { data, error } = await supabase
        .from('user_assessments')
        .insert([newAssessment])
        .select()
        .single();

      if (error) throw error;
      return data as UserAssessment;
    },
    onSuccess: async (assessment) => {
      queryClient.invalidateQueries({ queryKey: ['user-assessments'] });
      
      // If this is the 3rd assessment or an emergency, trigger matching
      if (assessment.assessment_number >= 3 || assessment.is_emergency) {
        await triggerMatching(assessment);
      } else {
        toast.success(`Assessment ${assessment.assessment_number} completed. ${3 - assessment.assessment_number} more assessment(s) needed before service matching.`);
      }
    },
  });

  // Create matches
  const createMatchMutation = useMutation({
    mutationFn: async (matches: Array<{
      provider_id: string;
      assessment_id: string;
      match_score: number;
      match_criteria: any;
      match_type: 'emergency' | 'standard' | 'follow_up';
    }>) => {
      if (!user) throw new Error('User not authenticated');

      const matchData = matches.map(match => ({
        user_id: user.id,
        ...match,
      }));

      const { data, error } = await supabase
        .from('match_logs')
        .insert(matchData)
        .select();

      if (error) throw error;
      return data;
    },
  });

  const triggerMatching = async (assessment: UserAssessment) => {
    try {
      const matches = findBestMatches(assessment, providers);
      
      if (matches.length === 0) {
        toast.error('No suitable service providers found. Please contact our support team.');
        return;
      }

      const matchData = matches.map(match => ({
        provider_id: match.provider.id,
        assessment_id: assessment.id,
        match_score: match.score,
        match_criteria: match.criteria,
        match_type: assessment.is_emergency ? 'emergency' as const : 'standard' as const,
      }));

      await createMatchMutation.mutateAsync(matchData);

      const matchType = assessment.is_emergency ? 'Emergency' : 'Standard';
      toast.success(`${matchType} matching completed! Found ${matches.length} suitable service provider(s).`);
      
    } catch (error) {
      console.error('Matching error:', error);
      toast.error('Failed to find matches. Please try again or contact support.');
    }
  };

  const getAssessmentStatus = () => {
    const completedAssessments = assessments.length;
    const hasEmergency = assessments.some(a => a.is_emergency);
    
    if (hasEmergency) {
      return { status: 'emergency', message: 'Emergency assessment completed - immediate matching activated' };
    } else if (completedAssessments >= 3) {
      return { status: 'ready', message: 'Ready for service matching' };
    } else {
      return { 
        status: 'pending', 
        message: `${completedAssessments}/3 assessments completed. ${3 - completedAssessments} more needed for matching.` 
      };
    }
  };

  return {
    assessments,
    isLoadingAssessments,
    currentAssessment,
    setCurrentAssessment,
    createAssessment: createAssessmentMutation.mutate,
    isCreatingAssessment: createAssessmentMutation.isPending,
    getAssessmentStatus,
    providers,
  };
};
