
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, CheckCircle, XCircle, AlertTriangle, TestTube } from 'lucide-react';
import { setupAdminUsers, verifyAdminSetup, testAdminLogin } from '@/utils/adminSetup';
import { toast } from 'sonner';

const AdminSetupPanel = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [setupResults, setSetupResults] = useState(null);
  const [verificationResults, setVerificationResults] = useState(null);
  const [testResults, setTestResults] = useState(null);

  const handleSetupAdmins = async () => {
    setIsCreating(true);
    setSetupResults(null);
    try {
      const results = await setupAdminUsers();
      setSetupResults(results);
      
      if (results.creationResults.every(r => r.success)) {
        toast.success('Admin users set up successfully!');
      } else {
        toast.error('Some admin users failed to set up. Check the results.');
      }
    } catch (error) {
      console.error('Setup error:', error);
      toast.error('Failed to set up admin users');
    } finally {
      setIsCreating(false);
    }
  };

  const handleVerifySetup = async () => {
    setIsVerifying(true);
    setVerificationResults(null);
    try {
      const results = await verifyAdminSetup();
      setVerificationResults(results);
      
      if (results.success) {
        toast.success('Admin setup verified successfully!');
      } else {
        toast.error('Admin setup verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to verify admin setup');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleTestLogin = async () => {
    setIsTesting(true);
    setTestResults(null);
    try {
      const founderTest = await testAdminLogin('founder@projectglo.org', 'GLOFounder2024!');
      const adminTest = await testAdminLogin('projectglo2024@gmail.com', 'GLOAdmin2024!');
      
      const results = [
        { email: 'founder@projectglo.org', ...founderTest },
        { email: 'projectglo2024@gmail.com', ...adminTest }
      ];
      
      setTestResults(results);
      
      if (results.every(r => r.success && r.isAdmin)) {
        toast.success('All admin login tests passed!');
      } else {
        toast.error('Some admin login tests failed');
      }
    } catch (error) {
      console.error('Test error:', error);
      toast.error('Failed to test admin login');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin User Setup
          </CardTitle>
          <CardDescription>
            Set up admin users for the GLO system. This will configure proper admin accounts with all necessary permissions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button 
              onClick={handleSetupAdmins}
              disabled={isCreating}
              className="flex-1"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting Up...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Setup Admin Users
                </>
              )}
            </Button>
            
            <Button 
              onClick={handleVerifySetup}
              disabled={isVerifying}
              variant="outline"
              className="flex-1"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verify Setup
                </>
              )}
            </Button>

            <Button 
              onClick={handleTestLogin}
              disabled={isTesting}
              variant="secondary"
              className="flex-1"
            >
              {isTesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <TestTube className="mr-2 h-4 w-4" />
                  Test Login
                </>
              )}
            </Button>
          </div>

          {setupResults && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Setup Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {setupResults.creationResults.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-medium">{result.email}</span>
                      </div>
                      <Badge variant={result.success ? "default" : "destructive"}>
                        {result.success ? "Set Up" : "Failed"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {verificationResults && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Verification Results</CardTitle>
              </CardHeader>
              <CardContent>
                {verificationResults.success ? (
                  <div className="space-y-3">
                    {verificationResults.data.map((user, index) => (
                      <div key={index} className="p-3 border rounded">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{user.email}</span>
                          <div className="flex gap-2">
                            <Badge variant={user.profile_exists ? "default" : "destructive"}>
                              {user.profile_exists ? "Profile ✓" : "No Profile"}
                            </Badge>
                            <Badge variant={user.is_admin ? "default" : "destructive"}>
                              {user.is_admin ? "Admin ✓" : "Not Admin"}
                            </Badge>
                            <Badge variant={user.email_confirmed ? "default" : "secondary"}>
                              {user.email_confirmed ? "Confirmed ✓" : "Unconfirmed"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Verification failed: {verificationResults.error}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {testResults && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Login Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <div key={index} className="p-3 border rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{result.email}</span>
                        <div className="flex gap-2">
                          <Badge variant={result.success ? "default" : "destructive"}>
                            {result.success ? "Login ✓" : "Failed"}
                          </Badge>
                          {result.success && (
                            <Badge variant={result.isAdmin ? "default" : "destructive"}>
                              {result.isAdmin ? "Admin ✓" : "Not Admin"}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {result.message && (
                        <p className="text-sm text-muted-foreground">{result.message}</p>
                      )}
                      {result.error && (
                        <p className="text-sm text-red-600">{result.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin Credentials</CardTitle>
          <CardDescription>
            Use these credentials to log in as admin after setup is complete.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Founder Account</h4>
              <p className="text-sm text-muted-foreground">Email: founder@projectglo.org</p>
              <p className="text-sm text-muted-foreground">Password: GLOFounder2024!</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Admin Account</h4>
              <p className="text-sm text-muted-foreground">Email: projectglo2024@gmail.com</p>
              <p className="text-sm text-muted-foreground">Password: GLOAdmin2024!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSetupPanel;
