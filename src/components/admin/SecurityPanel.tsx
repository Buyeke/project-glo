
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Settings, Activity, AlertTriangle } from 'lucide-react';
import SecurityConfiguration from './SecurityConfiguration';
import SecurityMonitoring from './SecurityMonitoring';
import EnhancedSecurityDashboard from './EnhancedSecurityDashboard';

const SecurityPanel = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Shield className="h-8 w-8 text-green-600" />
          Security Management Center
        </h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive security monitoring, configuration, and threat detection
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Monitoring
          </TabsTrigger>
          <TabsTrigger value="configuration" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alerts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <EnhancedSecurityDashboard />
        </TabsContent>

        <TabsContent value="monitoring">
          <SecurityMonitoring />
        </TabsContent>

        <TabsContent value="configuration">
          <SecurityConfiguration />
        </TabsContent>

        <TabsContent value="alerts">
          <div className="text-center py-12">
            <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-xl font-semibold mb-2">Security Alerts</h3>
            <p className="text-muted-foreground">
              Advanced alerting system coming soon. Currently monitoring through the Security Monitoring tab.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityPanel;
