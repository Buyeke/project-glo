
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { setupAdminUsers, verifyAdminSetup } from '@/utils/adminSetup';
import { toast } from 'sonner';

const AdminSetupPanel = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [setupResults, setSetupResults] = useState(null);
  const [verificationResults, setVerificationResults] = useState(null);

  const handleSetupAdmins = async () => {
    setIsCreating(true);
    try {
      const results = await setupAdminUsers();
      setSetupResults(results);
      
      if (results.creationResults.every(r => r.success)) {
        toast.success('Admin users created successfully!');
      } else {
        toast.error('Some admin users failed to create. Check the results.');
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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin User Setup
          </CardTitle>
          <CardDescription>
            Set up admin users for the GLO system. This will create proper admin accounts with all necessary permissions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button 
              onClick={handleSetupAdmins}
              disabled={isCreating}
              className="flex-1"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Admin Users...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Create Admin Users
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
          </div>

          {setupResults && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Creation Results</CardTitle>
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
                        {result.success ? "Created" : "Failed"}
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
