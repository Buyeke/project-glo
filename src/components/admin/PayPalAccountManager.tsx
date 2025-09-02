
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, AlertCircle, Settings, TestTube, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PayPalCredentials {
  clientId: string;
  clientSecret: string;
  environment: 'sandbox' | 'live';
  webhookId: string;
}

const PayPalAccountManager: React.FC = () => {
  const [credentials, setCredentials] = useState<PayPalCredentials>({
    clientId: '',
    clientSecret: '',
    environment: 'sandbox',
    webhookId: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [testResults, setTestResults] = useState<{
    connection: boolean | null;
    webhook: boolean | null;
    payment: boolean | null;
  }>({
    connection: null,
    webhook: null,
    payment: null
  });

  const updateCredentials = async () => {
    setIsUpdating(true);
    try {
      // Update PayPal secrets in Supabase
      const updates = [
        { name: 'PAYPAL_CLIENT_ID', value: credentials.clientId },
        { name: 'PAYPAL_CLIENT_SECRET', value: credentials.clientSecret },
        { name: 'PAYPAL_ENVIRONMENT', value: credentials.environment },
        { name: 'PAYPAL_WEBHOOK_ID', value: credentials.webhookId }
      ];

      for (const update of updates) {
        const { error } = await supabase.functions.invoke('update-secret', {
          body: update
        });
        if (error) throw error;
      }

      toast.success('PayPal credentials updated successfully');
      
      // Reset test results since credentials changed
      setTestResults({ connection: null, webhook: null, payment: null });
      
    } catch (error: any) {
      console.error('Failed to update PayPal credentials:', error);
      toast.error('Failed to update credentials: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const testConnection = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('test-paypal-connection');
      
      if (error) throw error;
      
      setTestResults(prev => ({ ...prev, connection: data.success }));
      
      if (data.success) {
        toast.success('PayPal connection successful');
      } else {
        toast.error('PayPal connection failed: ' + data.error);
      }
    } catch (error: any) {
      setTestResults(prev => ({ ...prev, connection: false }));
      toast.error('Connection test failed: ' + error.message);
    }
  };

  const testWebhook = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('test-paypal-webhook');
      
      if (error) throw error;
      
      setTestResults(prev => ({ ...prev, webhook: data.success }));
      
      if (data.success) {
        toast.success('Webhook configuration verified');
      } else {
        toast.error('Webhook test failed: ' + data.error);
      }
    } catch (error: any) {
      setTestResults(prev => ({ ...prev, webhook: false }));
      toast.error('Webhook test failed: ' + error.message);
    }
  };

  const testPayment = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('test-paypal-payment', {
        body: {
          amount: 100, // Test with 1 KES
          currency: 'KES',
          description: 'Test payment for PayPal integration'
        }
      });
      
      if (error) throw error;
      
      setTestResults(prev => ({ ...prev, payment: data.success }));
      
      if (data.success) {
        toast.success('Test payment created successfully');
        if (data.approval_url) {
          window.open(data.approval_url, '_blank');
        }
      } else {
        toast.error('Test payment failed: ' + data.error);
      }
    } catch (error: any) {
      setTestResults(prev => ({ ...prev, payment: false }));
      toast.error('Payment test failed: ' + error.message);
    }
  };

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return null;
    return status ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <AlertCircle className="w-4 h-4 text-red-500" />
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            PayPal Account Manager
          </CardTitle>
          <CardDescription>
            Safely switch to a new PayPal account and test the integration
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="credentials" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="instructions">Instructions</TabsTrigger>
        </TabsList>

        <TabsContent value="credentials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>PayPal API Credentials</CardTitle>
              <CardDescription>
                Enter your new PayPal REST API credentials from your PayPal Developer account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientId">Client ID</Label>
                  <Input
                    id="clientId"
                    type="text"
                    placeholder="Your PayPal Client ID"
                    value={credentials.clientId}
                    onChange={(e) => setCredentials(prev => ({ ...prev, clientId: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="clientSecret">Client Secret</Label>
                  <Input
                    id="clientSecret"
                    type="password"
                    placeholder="Your PayPal Client Secret"
                    value={credentials.clientSecret}
                    onChange={(e) => setCredentials(prev => ({ ...prev, clientSecret: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="environment">Environment</Label>
                  <Select 
                    value={credentials.environment} 
                    onValueChange={(value) => setCredentials(prev => ({ ...prev, environment: value as 'sandbox' | 'live' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                      <SelectItem value="live">Live (Production)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="webhookId">Webhook ID</Label>
                  <Input
                    id="webhookId"
                    type="text"
                    placeholder="Your PayPal Webhook ID"
                    value={credentials.webhookId}
                    onChange={(e) => setCredentials(prev => ({ ...prev, webhookId: e.target.value }))}
                  />
                </div>
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Make sure your webhook points to:
                  <br />
                  <code className="bg-muted px-1 rounded">
                    https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1/paypal-webhook
                  </code>
                  <br />
                  And has the <code>PAYMENT.SALE.COMPLETED</code> event enabled.
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={updateCredentials} 
                disabled={isUpdating || !credentials.clientId || !credentials.clientSecret || !credentials.webhookId}
                className="w-full"
              >
                {isUpdating ? 'Updating...' : 'Update PayPal Credentials'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                Integration Testing
              </CardTitle>
              <CardDescription>
                Test your PayPal integration step by step
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">1. API Connection Test</h4>
                    <p className="text-sm text-muted-foreground">
                      Verify credentials can authenticate with PayPal
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testResults.connection)}
                    <Button onClick={testConnection} variant="outline" size="sm">
                      Test Connection
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">2. Webhook Verification</h4>
                    <p className="text-sm text-muted-foreground">
                      Check webhook configuration and connectivity
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testResults.webhook)}
                    <Button onClick={testWebhook} variant="outline" size="sm">
                      Test Webhook
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">3. Test Payment</h4>
                    <p className="text-sm text-muted-foreground">
                      Create a test payment (1 KES)
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testResults.payment)}
                    <Button onClick={testPayment} variant="outline" size="sm">
                      Test Payment
                    </Button>
                  </div>
                </div>
              </div>

              <Alert>
                <Globe className="h-4 w-4" />
                <AlertDescription>
                  <strong>Testing Flow:</strong> Run tests in order. For production deployment, 
                  first test in sandbox mode, then switch to live environment and run a small live test.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instructions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Step-by-Step Instructions</CardTitle>
              <CardDescription>
                Follow these steps to safely switch PayPal accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium">Step 1: Create PayPal REST App</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Go to <a href="https://developer.paypal.com/" target="_blank" className="text-blue-600 underline">
                      PayPal Developer
                    </a> → My Apps & Credentials → Create App
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium">Step 2: Configure Webhook</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create webhook with URL: <code className="bg-muted px-1 rounded">
                      https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1/paypal-webhook
                    </code>
                    <br />
                    Enable event: <code className="bg-muted px-1 rounded">PAYMENT.SALE.COMPLETED</code>
                  </p>
                </div>

                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-medium">Step 3: Update Credentials</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enter your Client ID, Client Secret, and Webhook ID in the Credentials tab
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-medium">Step 4: Test Integration</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Run all tests in the Testing tab to verify everything works
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-medium">Step 5: Go Live</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Switch environment to "Live" and run a small test transaction
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PayPalAccountManager;
