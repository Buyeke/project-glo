
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useProfileManagement = (userId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateVisitCount = useMutation({
    mutationFn: async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('visit_count')
        .eq('id', userId)
        .single();

      const newCount = (profile?.visit_count || 0) + 1;

      const { error } = await supabase
        .from('profiles')
        .update({ 
          visit_count: newCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
      return newCount;
    },
    onSuccess: (newCount) => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      
      // Show milestone achievements
      if (newCount === 3) {
        toast({
          title: "🎉 Milestone Achieved!",
          description: "You've unlocked basic resources after 3 visits!",
        });
      } else if (newCount === 5) {
        toast({
          title: "🎉 Milestone Achieved!",
          description: "Advanced support is now available!",
        });
      } else if (newCount === 10) {
        toast({
          title: "🎉 Milestone Achieved!",
          description: "Mentor program access unlocked!",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update visit count.",
        variant: "destructive",
      });
    },
  });

  const updateSupportStage = useMutation({
    mutationFn: async (newStage: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          support_stage: newStage,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
      toast({
        title: "Support stage updated",
        description: "The support stage has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update support stage.",
        variant: "destructive",
      });
    },
  });

  return {
    updateVisitCount,
    updateSupportStage,
  };
};

export const useTeamMembers = () => {
  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          id,
          role,
          verified,
          department,
          profiles:user_id (
            id,
            full_name
          )
        `)
        .eq('verified', true);

      if (error) throw error;
      return data;
    },
  });

  return { teamMembers, isLoading };
};
