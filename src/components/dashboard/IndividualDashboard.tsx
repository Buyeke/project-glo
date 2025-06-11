
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Home, Briefcase, GraduationCap, MessageSquare, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface IndividualDashboardProps {
  profile: any;
}

const IndividualDashboard = ({ profile }: IndividualDashboardProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: userNeeds } = useQuery({
    queryKey: ['userNeeds', profile.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_needs')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: serviceRequests } = useQuery({
    queryKey: ['serviceRequests', profile.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_requests')
        .select(`
          *,
          ngo_details:ngo_id (
            organization_name,
            contact_email,
            contact_phone
          )
        `)
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: verifiedNgos } = useQuery({
    queryKey: ['verifiedNgos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ngo_details')
        .select('*')
        .eq('verified', true)
        .order('organization_name');
      
      if (error) throw error;
      return data;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'fulfilled': return 'bg-green-100 text-green-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const requestService = async (ngoId: string, serviceType: string) => {
    try {
      const { error } = await supabase
        .from('service_requests')
        .insert({
          user_id: profile.id,
          ngo_id: ngoId,
          service_type: serviceType,
          message: `Request for ${serviceType} support`,
        });

      if (error) throw error;

      toast({
        title: "Service Requested",
        description: "Your request has been sent to the organization.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send service request.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {profile.full_name}</h1>
          <p className="text-gray-600">Here's an overview of your support journey</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Available Services</TabsTrigger>
            <TabsTrigger value="requests">My Requests</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-8 w-8 text-primary" />
                    <div>
                      <div className="text-2xl font-bold">{userNeeds?.length || 0}</div>
                      <div className="text-sm text-muted-foreground">Active Needs</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="h-8 w-8 text-primary" />
                    <div>
                      <div className="text-2xl font-bold">{serviceRequests?.length || 0}</div>
                      <div className="text-sm text-muted-foreground">Service Requests</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Home className="h-8 w-8 text-primary" />
                    <div>
                      <div className="text-2xl font-bold">{verifiedNgos?.length || 0}</div>
                      <div className="text-sm text-muted-foreground">Partner Organizations</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current Needs */}
            <Card>
              <CardHeader>
                <CardTitle>Your Current Needs</CardTitle>
                <CardDescription>Support areas you're actively seeking help with</CardDescription>
              </CardHeader>
              <CardContent>
                {userNeeds?.length ? (
                  <div className="space-y-3">
                    {userNeeds.map((need) => (
                      <div key={need.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{need.need_type}</div>
                          <div className="text-sm text-muted-foreground">{need.description}</div>
                        </div>
                        <Badge className={getStatusColor(need.status)}>
                          {need.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No active needs. You can update your needs in your profile.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Recent Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Service Requests</CardTitle>
                <CardDescription>Your latest requests for support</CardDescription>
              </CardHeader>
              <CardContent>
                {serviceRequests?.slice(0, 3).map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg mb-3">
                    <div>
                      <div className="font-medium">{request.service_type}</div>
                      <div className="text-sm text-muted-foreground">
                        {request.ngo_details?.organization_name}
                      </div>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status.replace('_', ' ')}
                    </Badge>
                  </div>
                )) || (
                  <p className="text-muted-foreground text-center py-4">
                    No service requests yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Services</CardTitle>
                <CardDescription>Connect with verified organizations offering support</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {verifiedNgos?.map((ngo) => (
                    <Card key={ngo.id} className="p-4">
                      <div className="space-y-2">
                        <h3 className="font-semibold">{ngo.organization_name}</h3>
                        <p className="text-sm text-muted-foreground">{ngo.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {ngo.services_offered?.map((service, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-sm text-muted-foreground">{ngo.location}</span>
                          <Button 
                            size="sm"
                            onClick={() => requestService(ngo.id, ngo.services_offered?.[0] || 'General Support')}
                          >
                            Request Support
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Service Requests</CardTitle>
                <CardDescription>Track your requests and responses from organizations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {serviceRequests?.map((request) => (
                    <Card key={request.id} className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{request.service_type}</h3>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Organization: {request.ngo_details?.organization_name}
                        </p>
                        <p className="text-sm">{request.message}</p>
                        {request.response && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-sm font-medium">Response:</p>
                            <p className="text-sm">{request.response}</p>
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          Requested: {new Date(request.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </Card>
                  )) || (
                    <p className="text-muted-foreground text-center py-8">
                      No service requests yet. Visit the Available Services tab to get started.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>Communication with support organizations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Messages feature coming soon. For now, use the contact information provided by organizations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default IndividualDashboard;
