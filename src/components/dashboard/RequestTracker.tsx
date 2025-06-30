
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import FeedbackForm from '@/components/feedback/FeedbackForm';
import { useState } from 'react';

const RequestTracker = () => {
  const { user } = useAuth();
  const [showFeedbackFor, setShowFeedbackFor] = useState<string | null>(null);

  const { data: requests, isLoading, refetch } = useQuery({
    queryKey: ['user-service-requests', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('service_requests_tracking')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'in_progress':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading your requests...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Your Service Requests</CardTitle>
          <CardDescription>
            Track the status of your submitted requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!requests || requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No service requests found. Submit your first request to get started!
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold capitalize">
                          {request.service_type.replace('_', ' ')}
                        </h3>
                        <Badge className={getPriorityColor(request.priority)}>
                          {request.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Language: {request.language_used}</span>
                        <span>•</span>
                        <span>
                          Submitted: {new Date(request.submitted_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(request.status)}
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  {request.response_time_hours && (
                    <div className="text-sm text-muted-foreground">
                      Response time: {request.response_time_hours.toFixed(1)} hours
                    </div>
                  )}

                  {request.completion_time_hours && (
                    <div className="text-sm text-muted-foreground">
                      Total completion time: {request.completion_time_hours.toFixed(1)} hours
                    </div>
                  )}

                  {request.referral_made && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Referral made</span>
                      {request.referral_successful && (
                        <Badge className="bg-green-100 text-green-800">
                          Successful
                        </Badge>
                      )}
                    </div>
                  )}

                  {request.status === 'completed' && (
                    <div className="pt-2 border-t">
                      {showFeedbackFor === request.id ? (
                        <div className="space-y-4">
                          <FeedbackForm
                            serviceRequestId={request.id}
                            onFeedbackSubmitted={() => {
                              setShowFeedbackFor(null);
                              refetch();
                            }}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFeedbackFor(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => setShowFeedbackFor(request.id)}
                        >
                          Leave Feedback
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RequestTracker;
