
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, MessageSquare, Calendar, TrendingUp, Mail, Phone, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import BlogManagement from './BlogManagement';
import ContactSubmissionsPanel from './ContactSubmissionsPanel';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalContactSubmissions: 0,
    newSubmissions: 0,
    totalBookings: 0,
    totalFeedback: 0
  });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch various statistics
      const [
        { count: totalUsers },
        { count: totalContactSubmissions },
        { count: newSubmissions },
        { count: totalBookings },
        { count: totalFeedback }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('contact_submissions').select('*', { count: 'exact', head: true }),
        supabase.from('contact_submissions').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('service_bookings').select('*', { count: 'exact', head: true }),
        supabase.from('user_feedback').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        totalUsers: totalUsers || 0,
        totalContactSubmissions: totalContactSubmissions || 0,
        newSubmissions: newSubmissions || 0,
        totalBookings: totalBookings || 0,
        totalFeedback: totalFeedback || 0
      });

      // Fetch chart data (submissions by month)
      const { data: submissionData } = await supabase
        .from('contact_submissions')
        .select('created_at')
        .order('created_at', { ascending: false });

      // Process data for chart
      const monthlyData = submissionData?.reduce((acc, submission) => {
        const month = new Date(submission.created_at).toLocaleDateString('en-US', { 
          month: 'short', 
          year: 'numeric' 
        });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});

      const chartData = Object.entries(monthlyData || {})
        .map(([month, count]) => ({ month, submissions: count }))
        .slice(0, 6)
        .reverse();

      setChartData(chartData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const exportContactData = async () => {
    try {
      const response = await fetch('/functions/v1/contact-data-export', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Export successful! ${result.message}`);
      }
    } catch (error) {
      console.error('Error exporting contact data:', error);
      alert('Export failed. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your platform and monitor performance</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contact-submissions">Contact Submissions</TabsTrigger>
          <TabsTrigger value="blog">Blog Management</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Contact Submissions</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalContactSubmissions}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.newSubmissions} new submissions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Service Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBookings}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">User Feedback</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalFeedback}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Contact Submissions Trend</CardTitle>
              <CardDescription>Monthly contact form submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="submissions" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={exportContactData} className="w-full">
                  Export Contact Data
                </Button>
                <Button variant="outline" className="w-full">
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">New</Badge>
                    <span className="text-sm">Contact submission received</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">Updated</Badge>
                    <span className="text-sm">Service booking confirmed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">New</Badge>
                    <span className="text-sm">User feedback submitted</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contact-submissions">
          <ContactSubmissionsPanel />
        </TabsContent>

        <TabsContent value="blog">
          <BlogManagement />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Configure your platform settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Settings panel coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
