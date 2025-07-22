
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ShieldX } from 'lucide-react';

const AdminPanel = () => {
  const { user, loading: authLoading } = useAuth();

  const { data: isAdmin, isLoading: adminCheckLoading } = useQuery({
    queryKey: ['admin-check', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      console.log('Checking admin status for user:', user.email);
      const { data, error } = await supabase.rpc('is_admin_user');
      
      if (error) {
        console.error('Admin check error:', error);
        throw error;
      }
      
      console.log('Admin check result:', data);
      return data;
    },
    enabled: !!user,
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading authentication...</div>
      </div>
    );
  }

  // Show loading while checking admin status
  if (adminCheckLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Verifying admin access...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldX className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You need to be logged in to access the admin panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/admin/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldX className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to access the admin panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Only render AdminDashboard if user is confirmed admin
  if (isAdmin === true) {
    return <AdminDashboard />;
  }

  // Fallback loading state
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg">Loading admin panel...</div>
    </div>
  );
};

export default AdminPanel;
