import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Users, MessageSquare, Star, TrendingUp, Globe, Target } from 'lucide-react';
import ChatInteractionsPanel from './ChatInteractionsPanel';

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('7'); // days
  const [selectedMetric, setSelectedMetric] = useState('requests');

  // Fetch service requests data
  const { data: serviceRequests, isLoading: loadingRequests } = useQuery({
    queryKey: ['admin-service-requests', timeRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_requests_tracking')
        .select('*')
        .gte('created_at', new Date(Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch feedback data
  const { data: feedback, isLoading: loadingFeedback } = useQuery({
    queryKey: ['admin-feedback', timeRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_feedback')
        .select('*')
        .gte('created_at', new Date(Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch usage stats
  const { data: usageStats, isLoading: loadingUsage } = useQuery({
    queryKey: ['admin-usage-stats', timeRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('usage_stats')
        .select('*')
        .gte('created_at', new Date(Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch overall stats
  const { data: overallStats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // Get user stats
      const { data: users } = await supabase.from('profiles').select('id, user_type');
      
      // Get service request stats
      const { data: requests } = await supabase.from('service_requests_tracking').select('status, service_type');
      
      // Get feedback stats
      const { data: feedback } = await supabase.from('user_feedback').select('rating');
      
      // Get chat interaction stats
      const { data: chatStats } = await supabase.from('chat_interactions').select('detected_language, matched_intent');
      
      return {
        totalUsers: users?.length || 0,
        individualUsers: users?.filter(u => u.user_type === 'individual').length || 0,
        ngoUsers: users?.filter(u => u.user_type === 'ngo').length || 0,
        serviceRequests: requests?.length || 0,
        completedRequests: requests?.filter(r => r.status === 'completed').length || 0,
        avgRating: feedback?.length ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length : 0,
        chatInteractions: chatStats?.length || 0,
        languagesUsed: new Set(chatStats?.map(c => c.detected_language)).size || 0,
      };
    },
  });

  if (statsLoading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats?.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {overallStats?.individualUsers} individuals, {overallStats?.ngoUsers} NGOs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Requests</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats?.serviceRequests}</div>
            <p className="text-xs text-muted-foreground">
              {overallStats?.completedRequests} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chat Interactions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats?.chatInteractions}</div>
            <p className="text-xs text-muted-foreground">
              {overallStats?.languagesUsed} languages used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallStats?.avgRating ? overallStats.avgRating.toFixed(1) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              User satisfaction score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="chat-interactions">Chat Interactions</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Overview</CardTitle>
              <CardDescription>
                Key metrics and performance indicators for the Glo platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Overview dashboard with key metrics, recent activity, and platform health indicators.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat-interactions" className="space-y-4">
          <ChatInteractionsPanel />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage users, review profiles, and monitor user activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  User management interface coming soon...
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Management</CardTitle>
              <CardDescription>
                Monitor service requests, NGO partnerships, and resource allocation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Service management interface coming soon...
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports & Analytics</CardTitle>
              <CardDescription>
                Generate reports and analyze platform performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Reporting interface coming soon...
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
