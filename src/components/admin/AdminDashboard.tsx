
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  Building, 
  FileText, 
  Settings,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [meetingLink, setMeetingLink] = useState('');

  // Fetch all users
  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch all service bookings
  const { data: bookings = [] } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_bookings')
        .select(`
          *,
          profiles:user_id (full_name, user_type)
        `)
        .order('booking_date', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch all support requests
  const { data: supportRequests = [] } = useQuery({
    queryKey: ['admin-support-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch all chat interactions
  const { data: chatInteractions = [] } = useQuery({
    queryKey: ['admin-chat-interactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_interactions')
        .select(`
          *,
          profiles:user_id (full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    }
  });

  const handleAssignMeetingLink = async (bookingId: string) => {
    if (!meetingLink) {
      toast.error('Please enter a meeting link');
      return;
    }

    try {
      const { error } = await supabase
        .from('service_bookings')
        .update({ 
          meeting_link: meetingLink,
          status: 'confirmed'
        })
        .eq('id', bookingId);

      if (error) throw error;

      toast.success('Meeting link assigned successfully');
      setMeetingLink('');
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error assigning meeting link:', error);
      toast.error('Failed to assign meeting link');
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('support_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);

      if (error) throw error;
      toast.success('Request approved');
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    }
  };

  const handleDenyRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('support_requests')
        .update({ status: 'denied' })
        .eq('id', requestId);

      if (error) throw error;
      toast.success('Request denied');
    } catch (error) {
      console.error('Error denying request:', error);
      toast.error('Failed to deny request');
    }
  };

  const exportData = async (table: string) => {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*');

      if (error) throw error;

      // Create CSV content
      const csvContent = data.map(row => Object.values(row).join(',')).join('\n');
      const csvHeader = Object.keys(data[0] || {}).join(',');
      const fullCsv = csvHeader + '\n' + csvContent;

      // Download CSV
      const blob = new Blob([fullCsv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${table}_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success(`${table} data exported successfully`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const stats = [
    { label: 'Total Users', value: users.length, icon: Users },
    { label: 'Active Bookings', value: bookings.filter(b => b.status === 'confirmed').length, icon: Calendar },
    { label: 'Pending Requests', value: supportRequests.filter(r => r.status === 'pending').length, icon: MessageSquare },
    { label: 'Chat Interactions', value: chatInteractions.length, icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage GLO platform operations</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="requests">Support Requests</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="interactions">Chat Logs</TabsTrigger>
            <TabsTrigger value="exports">Export Data</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Service Bookings</h2>
              <Button onClick={() => exportData('service_bookings')}>
                <FileText className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
            <div className="grid gap-4">
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{booking.service_title}</h3>
                          <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                            {booking.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          User: {booking.profiles?.full_name || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Date: {new Date(booking.booking_date).toLocaleDateString()}
                        </p>
                        {booking.meeting_link && (
                          <p className="text-sm text-blue-600">
                            Meeting Link: {booking.meeting_link}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" onClick={() => setSelectedBooking(booking)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Assign Link
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Assign Meeting Link</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">
                                  Meeting Link (Zoom, Google Meet, etc.)
                                </label>
                                <Input
                                  value={meetingLink}
                                  onChange={(e) => setMeetingLink(e.target.value)}
                                  placeholder="https://zoom.us/j/..."
                                />
                              </div>
                              <Button onClick={() => handleAssignMeetingLink(booking.id)}>
                                Assign Link
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Support Requests</h2>
              <Button onClick={() => exportData('support_requests')}>
                <FileText className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
            <div className="grid gap-4">
              {supportRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{request.service_type}</h3>
                          <Badge variant={
                            request.status === 'approved' ? 'default' : 
                            request.status === 'denied' ? 'destructive' : 'secondary'
                          }>
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">Email: {request.user_email}</p>
                        <p className="text-sm text-gray-600">Phone: {request.phone_number}</p>
                        <p className="text-sm text-gray-600">Language: {request.language}</p>
                        <p className="text-sm text-gray-600">Priority: {request.priority}</p>
                        {request.message && (
                          <p className="text-sm text-gray-600">Message: {request.message}</p>
                        )}
                      </div>
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleApproveRequest(request.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDenyRequest(request.id)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Deny
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">User Management</h2>
              <Button onClick={() => exportData('profiles')}>
                <FileText className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
            <div className="grid gap-4">
              {users.map((user) => (
                <Card key={user.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{user.full_name || 'Unknown User'}</h3>
                          <Badge variant={user.user_type === 'admin' ? 'destructive' : 'default'}>
                            {user.user_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">Location: {user.location || 'Not specified'}</p>
                        <p className="text-sm text-gray-600">Phone: {user.phone || 'Not provided'}</p>
                        <p className="text-sm text-gray-600">
                          Joined: {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="interactions" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Chat Interactions</h2>
              <Button onClick={() => exportData('chat_interactions')}>
                <FileText className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
            <div className="grid gap-4">
              {chatInteractions.map((interaction) => (
                <Card key={interaction.id}>
                  <CardContent className="p-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {interaction.profiles?.full_name || 'Anonymous User'}
                        </h3>
                        <Badge variant="outline">
                          {interaction.detected_language || 'Unknown'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        <strong>Message:</strong> {interaction.original_message}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Response:</strong> {interaction.response}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(interaction.created_at).toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="exports" className="space-y-6">
            <h2 className="text-xl font-semibold">Export Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Users', table: 'profiles' },
                { name: 'Bookings', table: 'service_bookings' },
                { name: 'Support Requests', table: 'support_requests' },
                { name: 'Chat Interactions', table: 'chat_interactions' },
                { name: 'Services', table: 'services' },
              ].map((item) => (
                <Card key={item.table}>
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <FileText className="h-8 w-8 mx-auto text-blue-600" />
                      <h3 className="font-semibold">{item.name}</h3>
                      <Button onClick={() => exportData(item.table)} className="w-full">
                        Export CSV
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
