
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Shield, AlertTriangle, Activity, Clock, RefreshCw } from 'lucide-react';
import { securityMonitor } from '@/utils/enhancedSecurityMonitoring';
import { sessionManager } from '@/utils/enhancedSessionManager';
import { toast } from '@/hooks/use-toast';

const EnhancedSecurityDashboard = () => {
  const [metrics, setMetrics] = useState({
    failedLoginAttempts: 0,
    suspiciousActivities: 0,
    rateLimitViolations: 0,
    lastSecurityEvent: null as Date | null
  });
  const [sessionInfo, setSessionInfo] = useState({
    timeRemaining: 0,
    idleTime: 0,
    sessionAge: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSecurityMetrics();
    const interval = setInterval(fetchSecurityMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSecurityMetrics = async () => {
    try {
      const [securityMetrics, sessionData] = await Promise.all([
        securityMonitor.getSecurityMetrics(),
        Promise.resolve(sessionManager.getSessionInfo())
      ]);

      setMetrics(securityMetrics);
      setSessionInfo(sessionData);
    } catch (error) {
      console.error('Error fetching security metrics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch security metrics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const extendSession = async () => {
    const success = await sessionManager.extendSession();
    if (success) {
      toast({
        title: "Success",
        description: "Session extended successfully",
      });
      fetchSecurityMetrics();
    } else {
      toast({
        title: "Error",
        description: "Failed to extend session",
        variant: "destructive",
      });
    }
  };

  const resetSecurityMetrics = async () => {
    await securityMonitor.resetMetrics();
    await fetchSecurityMetrics();
    toast({
      title: "Success",
      description: "Security metrics reset successfully",
    });
  };

  const formatTime = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000);
    const hours = Math.floor(minutes / 60);
    return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
  };

  const getSecurityLevel = (): { level: string; color: string; score: number } => {
    const totalEvents = metrics.failedLoginAttempts + metrics.suspiciousActivities + metrics.rateLimitViolations;
    
    if (totalEvents === 0) return { level: 'Excellent', color: 'bg-green-100 text-green-800', score: 100 };
    if (totalEvents <= 5) return { level: 'Good', color: 'bg-blue-100 text-blue-800', score: 80 };
    if (totalEvents <= 15) return { level: 'Moderate', color: 'bg-yellow-100 text-yellow-800', score: 60 };
    return { level: 'High Risk', color: 'bg-red-100 text-red-800', score: 30 };
  };

  if (isLoading) {
    return <div className="p-6">Loading enhanced security metrics...</div>;
  }

  const securityLevel = getSecurityLevel();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Enhanced Security Dashboard
          </h2>
          <p className="text-muted-foreground">
            Real-time security monitoring and session management
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={extendSession} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Extend Session
          </Button>
          <Button onClick={resetSecurityMetrics} variant="outline">
            Reset Metrics
          </Button>
        </div>
      </div>

      {/* Security Level Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Security Status</CardTitle>
          <CardDescription>Overall security level assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <Badge className={securityLevel.color}>{securityLevel.level}</Badge>
              <p className="text-sm text-muted-foreground mt-1">
                Security Score: {securityLevel.score}/100
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="text-sm font-medium">
                {metrics.lastSecurityEvent 
                  ? new Date(metrics.lastSecurityEvent).toLocaleString()
                  : 'No recent events'
                }
              </p>
            </div>
          </div>
          <Progress value={securityLevel.score} className="w-full" />
        </CardContent>
      </Card>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed Logins</p>
                <p className="text-2xl font-bold text-red-600">{metrics.failedLoginAttempts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Suspicious Activities</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.suspiciousActivities}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rate Limit Violations</p>
                <p className="text-2xl font-bold text-yellow-600">{metrics.rateLimitViolations}</p>
              </div>
              <Shield className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session Information */}
      <Card>
        <CardHeader>
          <CardTitle>Session Management</CardTitle>
          <CardDescription>Current session status and timing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Session Age</p>
                <p className="text-lg">{formatTime(sessionInfo.sessionAge)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Idle Time</p>
                <p className="text-lg">{formatTime(sessionInfo.idleTime)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Time Remaining</p>
                <p className="text-lg">{formatTime(Math.max(0, sessionInfo.timeRemaining))}</p>
              </div>
            </div>
          </div>

          {sessionInfo.timeRemaining < 30 * 60 * 1000 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Your session will expire soon. Consider extending your session to avoid being logged out.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedSecurityDashboard;
