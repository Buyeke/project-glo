
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Heart, AlertTriangle } from 'lucide-react';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const validatePassword = (password: string) => {
    const errors: string[] = [];
    if (password.length < 8) errors.push('at least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('lowercase letter');
    if (!/\d/.test(password)) errors.push('number');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('special character');
    return errors;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validate passwords match
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      setIsLoading(false);
      return;
    }

    // Validate password strength
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setErrors({ password: `Password must contain ${passwordErrors.join(', ')}` });
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      toast.success('Password updated successfully!');
      navigate('/auth');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while updating your password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Heart className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  {errors.password}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Password must be at least 8 characters with uppercase, lowercase, number, and special character
              </p>
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Updating password...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
