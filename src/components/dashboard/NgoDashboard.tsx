
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Users, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface NgoDashboardProps {
  profile: any;
}

const NgoDashboard = ({ profile }: NgoDashboardProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [responseText, setResponseText] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const { data: ngoDetails } = useQuery({
    queryKey: ['ngoDetails', profile.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ngo_details')
        .select('*')
        .eq('user_id', profile.id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: serviceRequests, refetch: refetchRequests } = useQuery({
    queryKey: ['ngoServiceRequests', ngoDetails?.id],
    queryFn: async () => {
      if (!ngoDetails?.id) return [];
      const { data, error } = await supabase
        .from('service_requests')
        .select(`
          *,
          profiles:user_id (
            full_name,
            age,
            location,
            phone
          )
        `)
        .eq('ngo_id', ngoDetails.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!ngoDetails?.id,
  });

  const updateRequestStatus = async (requestId: string, status: string, response?: string) => {
    try {
      const updateData: any = { status };
      if (response) updateData.response = response;

      const { error } = await supabase
        .from('service_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Request Updated",
        description: `Request status changed to ${status}.`,
      });

      refetchRequests();
      setSelectedRequestId(null);
      setResponseText('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update request.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!ngoDetails?.verified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <CardTitle>Verification Pending</CardTitle>
            <CardDescription>
              Your NGO application is under review. You'll receive an email once your organization is verified.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Organization:</strong> {ngoDetails?.organization_name}</p>
              <p><strong>Location:</strong> {ngoDetails?.location}</p>
              <p><strong>Services:</strong> {ngoDetails?.services_offered?.join(', ')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingRequests = serviceRequests?.filter(req => req.status === 'pending') || [];
  const activeRequests = serviceRequests?.filter(req => ['accepted', 'in_progress'].includes(req.status)) || [];
  const completedRequests = serviceRequests?.filter(req => req.status === 'completed') || [];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{ngoDetails?.organization_name}</h1>
          <p className="text-gray-600">Manage your services and support requests</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="requests">Service Requests</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-8 w-8 text-yellow-500" />
                    <div>
                      <div className="text-2xl font-bold">{pendingRequests.length}</div>
                      <div className="text-sm text-muted-foreground">Pending Requests</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Users className="h-8 w-8 text-blue-500" />
                    <div>
                      <div className="text-2xl font-bold">{activeRequests.length}</div>
                      <div className="text-sm text-muted-foreground">Active Cases</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div>
                      <div className="text-2xl font-bold">{completedRequests.length}</div>
                      <div className="text-sm text-muted-foreground">Completed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Users className="h-8 w-8 text-primary" />
                    <div>
                      <div className="text-2xl font-bold">{ngoDetails?.capacity || 'N/A'}</div>
                      <div className="text-sm text-muted-foreground">Service Capacity</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Service Requests</CardTitle>
                <CardDescription>Latest requests requiring your attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {serviceRequests?.slice(0, 5).map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">{request.profiles?.full_name}</div>
                        <div className="text-sm text-muted-foreground">{request.service_type}</div>
                        <div className="text-xs text-muted-foreground">
                          {request.profiles?.location} • {new Date(request.created_at).toLocaleDateString()}
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pending Requests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    <span>Pending ({pendingRequests.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingRequests.map((request) => (
                      <Card key={request.id} className="p-3">
                        <div className="space-y-2">
                          <div className="font-medium">{request.profiles?.full_name}</div>
                          <div className="text-sm text-muted-foreground">{request.service_type}</div>
                          <div className="text-sm">{request.message}</div>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              onClick={() => updateRequestStatus(request.id, 'accepted')}
                            >
                              Accept
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedRequestId(request.id);
                                setResponseText('');
                              }}
                            >
                              Respond
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => updateRequestStatus(request.id, 'declined', 'Unable to accommodate this request at this time.')}
                            >
                              Decline
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                    {pendingRequests.length === 0 && (
                      <p className="text-muted-foreground text-sm text-center py-4">
                        No pending requests
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Active Cases */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <span>Active ({activeRequests.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activeRequests.map((request) => (
                      <Card key={request.id} className="p-3">
                        <div className="space-y-2">
                          <div className="font-medium">{request.profiles?.full_name}</div>
                          <div className="text-sm text-muted-foreground">{request.service_type}</div>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status.replace('_', ' ')}
                          </Badge>
                          <div className="flex space-x-2">
                            {request.status === 'accepted' && (
                              <Button 
                                size="sm"
                                onClick={() => updateRequestStatus(request.id, 'in_progress')}
                              >
                                Start Service
                              </Button>
                            )}
                            {request.status === 'in_progress' && (
                              <Button 
                                size="sm"
                                onClick={() => updateRequestStatus(request.id, 'completed')}
                              >
                                Mark Complete
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                    {activeRequests.length === 0 && (
                      <p className="text-muted-foreground text-sm text-center py-4">
                        No active cases
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Completed */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Completed ({completedRequests.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {completedRequests.slice(0, 5).map((request) => (
                      <Card key={request.id} className="p-3">
                        <div className="space-y-1">
                          <div className="font-medium">{request.profiles?.full_name}</div>
                          <div className="text-sm text-muted-foreground">{request.service_type}</div>
                          <div className="text-xs text-muted-foreground">
                            Completed: {new Date(request.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                      </Card>
                    ))}
                    {completedRequests.length === 0 && (
                      <p className="text-muted-foreground text-sm text-center py-4">
                        No completed cases
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Response Modal */}
            {selectedRequestId && (
              <Card className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg w-full max-w-md">
                  <h3 className="text-lg font-semibold mb-4">Respond to Request</h3>
                  <Textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Type your response here..."
                    className="mb-4"
                  />
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => updateRequestStatus(selectedRequestId, 'accepted', responseText)}
                    >
                      Accept with Response
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSelectedRequestId(null);
                        setResponseText('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Impact Analytics</CardTitle>
                <CardDescription>Your organization's impact metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{serviceRequests?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Requests</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{completedRequests.length}</div>
                    <div className="text-sm text-muted-foreground">People Helped</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {serviceRequests?.length ? Math.round((completedRequests.length / serviceRequests.length) * 100) : 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{ngoDetails?.services_offered?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Services Offered</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization Settings</CardTitle>
                <CardDescription>Manage your organization profile and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Organization Name</label>
                    <p className="text-sm text-muted-foreground">{ngoDetails?.organization_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Services Offered</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {ngoDetails?.services_offered?.map((service, index) => (
                        <Badge key={index} variant="secondary">{service}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Contact Information</label>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Email: {ngoDetails?.contact_email}</p>
                      <p>Phone: {ngoDetails?.contact_phone}</p>
                      <p>Location: {ngoDetails?.location}</p>
                    </div>
                  </div>
                  <Button variant="outline">
                    Request Profile Update
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NgoDashboard;
