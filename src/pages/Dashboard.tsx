
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import IndividualDashboard from '@/components/dashboard/IndividualDashboard';
import NgoDashboard from '@/components/dashboard/NgoDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading your dashboard...</span>
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
              We couldn't find your profile information. Please try signing out and back in.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (profile.user_type === 'individual') {
    return <IndividualDashboard profile={profile} />;
  } else if (profile.user_type === 'ngo') {
    return <NgoDashboard profile={profile} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Unknown User Type</CardTitle>
          <CardDescription>
            Your account type is not recognized. Please contact support.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};

export default Dashboard;
