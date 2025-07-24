
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, AlertTriangle, Activity, Eye, Search, Filter, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

interface SecurityLog {
  id: string;
  user_id?: string;
  event_type: string;
  event_data?: Json;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

interface RateLimit {
  id: string;
  identifier: string;
  action_type: string;
  attempt_count: number;
  window_start: string;
  blocked_until?: string;
}

const SecurityPanel = () => {
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [rateLimits, setRateLimits] = useState<RateLimit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('24h');

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      // Fetch security logs
      const { data: logs, error: logsError } = await supabase
        .from('security_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (logsError) throw logsError;

      // Fetch rate limits
      const { data: limits, error: limitsError } = await supabase
        .from('rate_limits')
        .select('*')
        .order('updated_at', { ascending: false });

      if (limitsError) throw limitsError;

      setSecurityLogs(logs || []);
      setRateLimits(limits || []);
    } catch (error) {
      console.error('Error fetching security data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch security data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportSecurityLogs = async () => {
    try {
      const csvContent = [
        ['Timestamp', 'Event Type', 'User ID', 'IP Address', 'Details'].join(','),
        ...securityLogs.map(log => [
          new Date(log.created_at).toLocaleString(),
          log.event_type,
          log.user_id || 'N/A',
          log.ip_address || 'N/A',
          JSON.stringify(log.event_data || {}).replace(/"/g, '""')
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `security-logs-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Security logs exported successfully",
      });
    } catch (error) {
      console.error('Error exporting logs:', error);
      toast({
        title: "Error",
        description: "Failed to export logs",
        variant: "destructive",
      });
    }
  };

  const clearRateLimit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('rate_limits')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchSecurityData();
      toast({
        title: "Success",
        description: "Rate limit cleared successfully",
      });
    } catch (error) {
      console.error('Error clearing rate limit:', error);
      toast({
        title: "Error",
        description: "Failed to clear rate limit",
        variant: "destructive",
      });
    }
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'login_failure':
      case 'unauthorized_access':
      case 'suspicious_activity':
        return 'bg-red-100 text-red-800';
      case 'rate_limit_exceeded':
        return 'bg-yellow-100 text-yellow-800';
      case 'login_success':
      case 'contact_submission':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatEventData = (eventData: Json): string => {
    if (!eventData) return '';
    if (typeof eventData === 'string') return eventData;
    if (typeof eventData === 'object' && eventData !== null) {
      return JSON.stringify(eventData);
    }
    return String(eventData);
  };

  const filteredLogs = securityLogs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip_address?.includes(searchTerm) ||
      formatEventData(log.event_data).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEventType = eventTypeFilter === 'all' || log.event_type === eventTypeFilter;
    
    const now = new Date();
    const logDate = new Date(log.created_at);
    const timeDiff = now.getTime() - logDate.getTime();
    
    let matchesTime = true;
    switch (timeFilter) {
      case '1h':
        matchesTime = timeDiff <= 60 * 60 * 1000;
        break;
      case '24h':
        matchesTime = timeDiff <= 24 * 60 * 60 * 1000;
        break;
      case '7d':
        matchesTime = timeDiff <= 7 * 24 * 60 * 60 * 1000;
        break;
    }
    
    return matchesSearch && matchesEventType && matchesTime;
  });

  if (isLoading) {
    return <div className="p-6">Loading security data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Security Panel
          </h2>
          <p className="text-muted-foreground">
            Monitor security events and manage rate limits
          </p>
        </div>
        <Button onClick={exportSecurityLogs}>
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { 
            label: 'Total Events', 
            value: securityLogs.length, 
            color: 'bg-blue-100 text-blue-800',
            icon: Activity
          },
          { 
            label: 'Failed Logins', 
            value: securityLogs.filter(log => log.event_type === 'login_failure').length, 
            color: 'bg-red-100 text-red-800',
            icon: AlertTriangle
          },
          { 
            label: 'Rate Limits', 
            value: rateLimits.filter(limit => limit.blocked_until && new Date(limit.blocked_until) > new Date()).length, 
            color: 'bg-yellow-100 text-yellow-800',
            icon: Shield
          },
          { 
            label: 'Suspicious Activity', 
            value: securityLogs.filter(log => log.event_type === 'suspicious_activity').length, 
            color: 'bg-orange-100 text-orange-800',
            icon: Eye
          }
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Event Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="login_attempt">Login Attempts</SelectItem>
              <SelectItem value="login_failure">Login Failures</SelectItem>
              <SelectItem value="contact_submission">Contact Submissions</SelectItem>
              <SelectItem value="rate_limit_exceeded">Rate Limits</SelectItem>
              <SelectItem value="suspicious_activity">Suspicious Activity</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">Last Hour</SelectItem>
            <SelectItem value="24h">Last 24h</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Security Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Security Logs</CardTitle>
          <CardDescription>
            Recent security events and activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No security logs found</p>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge className={getEventTypeColor(log.event_type)}>
                      {log.event_type.replace('_', ' ')}
                    </Badge>
                    <div>
                      <p className="font-medium">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        IP: {log.ip_address || 'N/A'} | User: {log.user_id || 'Anonymous'}
                      </p>
                      {log.event_data && (
                        <p className="text-sm text-muted-foreground">
                          {formatEventData(log.event_data)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rate Limits */}
      <Card>
        <CardHeader>
          <CardTitle>Active Rate Limits</CardTitle>
          <CardDescription>
            Currently active rate limits and blocked IPs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rateLimits.filter(limit => limit.blocked_until && new Date(limit.blocked_until) > new Date()).length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No active rate limits</p>
            ) : (
              rateLimits
                .filter(limit => limit.blocked_until && new Date(limit.blocked_until) > new Date())
                .map((limit) => (
                  <div key={limit.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{limit.identifier}</p>
                      <p className="text-sm text-muted-foreground">
                        Action: {limit.action_type} | Attempts: {limit.attempt_count}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Blocked until: {new Date(limit.blocked_until!).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => clearRateLimit(limit.id)}
                    >
                      Clear
                    </Button>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityPanel;
