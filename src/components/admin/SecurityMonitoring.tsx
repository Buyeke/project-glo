
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Shield, Eye, Clock, Filter, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SecurityLog {
  id: string;
  event_type: string;
  user_id?: string;
  ip_address: string;
  user_agent: string;
  event_data: any;
  created_at: string;
}

const SecurityMonitoring = () => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: securityLogs = [], isLoading, refetch } = useQuery({
    queryKey: ['security-logs', filterType, searchTerm],
    queryFn: async (): Promise<SecurityLog[]> => {
      let query = supabase
        .from('security_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filterType !== 'all') {
        query = query.eq('event_type', filterType);
      }

      if (searchTerm) {
        query = query.or(`ip_address.ilike.%${searchTerm}%,user_agent.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const getSeverityColor = (eventType: string) => {
    switch (eventType) {
      case 'login_failure':
      case 'unauthorized_access':
        return 'bg-red-100 text-red-800';
      case 'suspicious_activity':
      case 'rate_limit_exceeded':
        return 'bg-orange-100 text-orange-800';
      case 'admin_access':
        return 'bg-yellow-100 text-yellow-800';
      case 'login_success':
      case 'contact_submission':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'login_failure':
      case 'suspicious_activity':
      case 'unauthorized_access':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'admin_access':
      case 'rate_limit_exceeded':
        return <Shield className="h-4 w-4 text-orange-500" />;
      case 'login_success':
        return <Shield className="h-4 w-4 text-green-500" />;
      default:
        return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityLabel = (eventType: string) => {
    switch (eventType) {
      case 'login_failure':
      case 'unauthorized_access':
        return 'High';
      case 'suspicious_activity':
      case 'rate_limit_exceeded':
        return 'Medium';
      case 'admin_access':
        return 'Low';
      case 'login_success':
      case 'contact_submission':
        return 'Info';
      default:
        return 'Low';
    }
  };

  const eventTypeOptions = [
    { value: 'all', label: 'All Events' },
    { value: 'login_attempt', label: 'Login Attempts' },
    { value: 'login_success', label: 'Successful Logins' },
    { value: 'login_failure', label: 'Failed Logins' },
    { value: 'admin_access', label: 'Admin Access' },
    { value: 'contact_submission', label: 'Contact Submissions' },
    { value: 'rate_limit_exceeded', label: 'Rate Limit Exceeded' },
    { value: 'suspicious_activity', label: 'Suspicious Activity' },
    { value: 'unauthorized_access', label: 'Unauthorized Access' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Security Monitoring</h2>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Event Type</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventTypeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search IP or User Agent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
          <CardDescription>
            Real-time security event monitoring and alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading security logs...</div>
          ) : securityLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No security events found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {securityLogs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getEventIcon(log.event_type)}
                      <div>
                        <div className="font-medium capitalize">
                          {log.event_type.replace('_', ' ')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    <Badge className={getSeverityColor(log.event_type)}>
                      {getSeverityLabel(log.event_type)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">IP Address:</span> {log.ip_address || 'Unknown'}
                    </div>
                    <div>
                      <span className="font-medium">User ID:</span> {log.user_id || 'Anonymous'}
                    </div>
                  </div>

                  {log.event_data && (
                    <div className="bg-muted p-3 rounded-md">
                      <div className="font-medium text-sm mb-2">Event Details:</div>
                      <pre className="text-xs text-muted-foreground overflow-x-auto">
                        {JSON.stringify(log.event_data, null, 2)}
                      </pre>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground border-t pt-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>User Agent: {log.user_agent || 'Unknown'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityMonitoring;
