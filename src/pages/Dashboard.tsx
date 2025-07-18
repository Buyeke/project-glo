
import React, { Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LazyComponents } from '@/utils/performanceOptimizations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const DashboardLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Card className="w-96">
      <CardContent className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading your dashboard...</span>
      </CardContent>
    </Card>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_type, full_name')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes - profile data doesn't change often
  });

  if (isLoading) {
    return <DashboardLoader />;
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

  // Admin users get the admin dashboard
  if (profile.user_type === 'admin') {
    return (
      <Suspense fallback={<DashboardLoader />}>
        <LazyComponents.AdminDashboard />
      </Suspense>
    );
  }

  // NGO and partner users get the NGO dashboard
  if (profile.user_type === 'ngo' || profile.user_type === 'partner') {
    return (
      <Suspense fallback={<DashboardLoader />}>
        <LazyComponents.NgoDashboard profile={profile} />
      </Suspense>
    );
  }

  // Individual users get the simple dashboard
  if (profile.user_type === 'individual') {
    return (
      <Suspense fallback={<DashboardLoader />}>
        <LazyComponents.SimpleDashboard profile={profile} />
      </Suspense>
    );
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
