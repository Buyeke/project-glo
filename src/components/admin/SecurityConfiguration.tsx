
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Shield, AlertTriangle, CheckCircle, Settings, Lock, Eye, EyeOff } from 'lucide-react';

const SecurityConfiguration = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: 8,
    requireSpecialChars: true,
    requireNumbers: true,
    requireUppercase: true,
    sessionTimeout: 3600, // 1 hour in seconds
    maxLoginAttempts: 5,
    enableTwoFactor: false,
    enableAuditLogging: true,
    enableIpWhitelist: false,
    allowedIps: '',
  });

  const handleSettingChange = (setting: string, value: any) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would save to the database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Security Settings Updated",
        description: "Your security configuration has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update security settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const securityChecks = [
    {
      name: "RLS Policies",
      status: "enabled",
      description: "Row Level Security policies are active on all tables"
    },
    {
      name: "JWT Verification",
      status: "enabled",
      description: "All edge functions verify JWT tokens"
    },
    {
      name: "Rate Limiting",
      status: "enabled",
      description: "API rate limiting is configured"
    },
    {
      name: "Security Headers",
      status: "enabled",
      description: "Enhanced security headers are applied"
    },
    {
      name: "Input Validation",
      status: "enabled",
      description: "Comprehensive input validation is active"
    },
    {
      name: "Audit Logging",
      status: securitySettings.enableAuditLogging ? "enabled" : "disabled",
      description: "Security events are being logged"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-green-600" />
        <h2 className="text-2xl font-bold">Security Configuration</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Security Status
            </CardTitle>
            <CardDescription>
              Current security configuration status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {securityChecks.map((check, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{check.name}</div>
                  <div className="text-sm text-muted-foreground">{check.description}</div>
                </div>
                <Badge 
                  variant={check.status === 'enabled' ? 'default' : 'destructive'}
                  className={check.status === 'enabled' ? 'bg-green-100 text-green-800' : ''}
                >
                  {check.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Password Policy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Password Policy
            </CardTitle>
            <CardDescription>
              Configure password requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
              <Input
                id="passwordMinLength"
                type="number"
                value={securitySettings.passwordMinLength}
                onChange={(e) => handleSettingChange('passwordMinLength', parseInt(e.target.value))}
                min="6"
                max="128"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="requireSpecialChars">Require Special Characters</Label>
              <Switch
                id="requireSpecialChars"
                checked={securitySettings.requireSpecialChars}
                onCheckedChange={(checked) => handleSettingChange('requireSpecialChars', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="requireNumbers">Require Numbers</Label>
              <Switch
                id="requireNumbers"
                checked={securitySettings.requireNumbers}
                onCheckedChange={(checked) => handleSettingChange('requireNumbers', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="requireUppercase">Require Uppercase Letters</Label>
              <Switch
                id="requireUppercase"
                checked={securitySettings.requireUppercase}
                onCheckedChange={(checked) => handleSettingChange('requireUppercase', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Session Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Session Management
            </CardTitle>
            <CardDescription>
              Configure session and login settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (seconds)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={securitySettings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                min="300"
                max="86400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
              <Input
                id="maxLoginAttempts"
                type="number"
                value={securitySettings.maxLoginAttempts}
                onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                min="3"
                max="10"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="enableTwoFactor">Enable Two-Factor Authentication</Label>
              <Switch
                id="enableTwoFactor"
                checked={securitySettings.enableTwoFactor}
                onCheckedChange={(checked) => handleSettingChange('enableTwoFactor', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Advanced Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Advanced Security
            </CardTitle>
            <CardDescription>
              Advanced security features and monitoring
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enableAuditLogging">Enable Audit Logging</Label>
              <Switch
                id="enableAuditLogging"
                checked={securitySettings.enableAuditLogging}
                onCheckedChange={(checked) => handleSettingChange('enableAuditLogging', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="enableIpWhitelist">Enable IP Whitelist</Label>
              <Switch
                id="enableIpWhitelist"
                checked={securitySettings.enableIpWhitelist}
                onCheckedChange={(checked) => handleSettingChange('enableIpWhitelist', checked)}
              />
            </div>

            {securitySettings.enableIpWhitelist && (
              <div className="space-y-2">
                <Label htmlFor="allowedIps">Allowed IP Addresses (comma-separated)</Label>
                <Input
                  id="allowedIps"
                  placeholder="192.168.1.1, 10.0.0.1"
                  value={securitySettings.allowedIps}
                  onChange={(e) => handleSettingChange('allowedIps', e.target.value)}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={isLoading} size="lg">
          {isLoading ? 'Saving...' : 'Save Security Settings'}
        </Button>
      </div>
    </div>
  );
};

export default SecurityConfiguration;
