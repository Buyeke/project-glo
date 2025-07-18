
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import ProfileHeader from './ProfileHeader';
import ConcernsList from './ConcernsList';
import AllocatedResources from './AllocatedResources';
import VisitProgress from './VisitProgress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface EnhancedProfileViewProps {
  userId?: string;
}

const EnhancedProfileView = ({ userId }: EnhancedProfileViewProps) => {
  const { user } = useAuth();
  const profileId = userId || user?.id;
  const isOwner = !userId || userId === user?.id;

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', profileId],
    queryFn: async () => {
      if (!profileId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!profileId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading profile...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>
              The requested profile could not be found.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <ProfileHeader profile={profile} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <ConcernsList userId={profile.id} isOwner={isOwner} />
          <VisitProgress 
            visitCount={profile.visit_count || 0} 
            supportStage={profile.support_stage || 'initial'} 
          />
        </div>
        
        <div className="space-y-6">
          <AllocatedResources userId={profile.id} />
        </div>
      </div>
    </div>
  );
};

export default EnhancedProfileView;
