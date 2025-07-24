
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Shield, CheckCircle, XCircle, AlertTriangle, TestTube, RefreshCw, Key } from 'lucide-react';
import { setupAdminUsers, verifyAdminSetup, testAdminLogin } from '@/utils/adminSetup';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdminSetupPanel = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [verificationResults, setVerificationResults] = useState(null);
  const [testResults, setTestResults] = useState(null);

  const handleVerifySetup = async () => {
    setIsVerifying(true);
    setVerificationResults(null);
    try {
      const results = await verifyAdminSetup();
      setVerificationResults(results);
      
      if (results.success) {
        const allConfigured = results.data.every(user => 
          user.profile_exists && user.is_admin && user.email_confirmed
        );
        
        if (allConfigured) {
          toast.success('Admin setup verified successfully! Both users are properly configured.');
        } else {
          toast.success('Admin setup verified, but some users need configuration.');
        }
      } else {
        toast.error('Admin setup verification failed: ' + results.error);
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
        toast.error('Some admin login tests failed. You may need to reset the passwords.');
      }
    } catch (error) {
      console.error('Test error:', error);
      toast.error('Failed to test admin login');
    } finally {
      setIsTesting(false);
    }
  };

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    try {
      const setupResults = await setupAdminUsers();
      
      if (setupResults.verification.success) {
        setVerificationResults(setupResults.verification);
        toast.success('Status refreshed successfully');
      } else {
        toast.error('Failed to refresh status: ' + setupResults.verification.error);
      }
    } catch (error) {
      console.error('Refresh error:', error);
      toast.error('Failed to refresh status');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleResetPassword = async (email: string) => {
    setIsResettingPassword(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });

      if (error) {
        console.error('Password reset error:', error);
        toast.error(`Failed to send password reset email: ${error.message}`);
      } else {
        toast.success(`Password reset email sent to ${email}. Check your inbox and follow the link to set a new password.`);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('Failed to send password reset email');
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin User Setup Status
          </CardTitle>
          <CardDescription>
            The admin users have been configured via database migration. Use these tools to verify and test the setup.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Button 
              onClick={handleVerifySetup}
              disabled={isVerifying}
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
              variant="outline"
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

            <Button 
              onClick={handleRefreshStatus}
              disabled={isRefreshing}
              variant="secondary"
              className="flex-1"
            >
              {isRefreshing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Status
                </>
              )}
            </Button>
          </div>

          {verificationResults && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Admin Setup Status</CardTitle>
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
                        {user.profile_exists && user.is_admin && user.email_confirmed && (
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-green-600 font-medium">
                              ✓ Ready for admin access
                            </div>
                            <Button
                              onClick={() => handleResetPassword(user.email)}
                              disabled={isResettingPassword}
                              variant="outline"
                              size="sm"
                            >
                              {isResettingPassword ? (
                                <>
                                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <Key className="mr-2 h-3 w-3" />
                                  Reset Password
                                </>
                              )}
                            </Button>
                          </div>
                        )}
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
                        <p className="text-sm text-green-600">{result.message}</p>
                      )}
                      {result.error && (
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-red-600">{result.error}</p>
                          <Button
                            onClick={() => handleResetPassword(result.email)}
                            disabled={isResettingPassword}
                            variant="outline"
                            size="sm"
                          >
                            {isResettingPassword ? (
                              <>
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Key className="mr-2 h-3 w-3" />
                                Reset Password
                              </>
                            )}
                          </Button>
                        </div>
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
          <CardTitle>Admin Login Information</CardTitle>
          <CardDescription>
            Use these credentials to access the admin panel after setup verification.
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

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>1. Click "Verify Setup" to check the current admin configuration</p>
            <p>2. Click "Test Login" to verify both admin accounts can log in successfully</p>
            <p>3. If login tests fail, use the "Reset Password" button to set new passwords</p>
            <p>4. After password reset, check your email and follow the link to set a new password</p>
            <p>5. Once passwords are set, you can access the admin panel at <code>/admin</code></p>
            <p>6. Use the admin login page at <code>/admin-login</code> to access the system</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSetupPanel;
