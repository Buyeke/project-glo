import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Phone, Mail, Briefcase } from 'lucide-react';

interface EmployerAuthProps {}

const EmployerAuth: React.FC<EmployerAuthProps> = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    company_name: '',
    contact_person: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/auth/reset`
      });

      if (error) throw error;

      setResetEmailSent(true);
      toast.success('Reset email sent! Check your email for a password reset link.');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const signUpData = {
        email: authMethod === 'email' ? formData.email : `${formData.phone}@temp.employer`,
        password: formData.password,
        options: {
          data: {
            company_name: formData.company_name,
            contact_person: formData.contact_person,
            phone_number: formData.phone,
            user_type: 'employer'
          },
          emailRedirectTo: `${window.location.origin}/employer-dashboard`
        }
      };

      const { data, error } = await supabase.auth.signUp(signUpData);

      if (error) throw error;

      if (data.user) {
        // Create employer profile
        const { error: profileError } = await supabase
          .from('employer_profiles')
          .insert({
            user_id: data.user.id,
            company_name: formData.company_name,
            contact_person: formData.contact_person,
            phone_number: formData.phone,
            email: formData.email,
            verification_method: authMethod
          });

        if (profileError) throw profileError;

        toast.success('Account created successfully! Please check your email to verify your account.');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during sign up');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: authMethod === 'email' ? formData.email : `${formData.phone}@temp.employer`,
        password: formData.password
      });

      if (error) throw error;
      toast.success('Signed in successfully!');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Briefcase className="mx-auto h-12 w-12 text-blue-600" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Reset Employer Password
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {resetEmailSent ? 
                'Check your email for a reset link' : 
                'Enter your email to receive a password reset link'
              }
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              {resetEmailSent ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center">
                    We've sent a password reset link to {forgotPasswordEmail}. 
                    Click the link in your email to reset your password.
                  </p>
                  <Button 
                    onClick={() => setShowForgotPassword(false)} 
                    variant="outline" 
                    className="w-full"
                  >
                    Back to Employer Login
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="resetEmail">Email</Label>
                    <Input
                      id="resetEmail"
                      type="email"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      placeholder="employer@company.com"
                      required
                    />
                  </div>
                  <Button 
                    onClick={handleForgotPassword} 
                    className="w-full bg-blue-600 hover:bg-blue-700" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                  <Button 
                    onClick={() => setShowForgotPassword(false)} 
                    variant="outline" 
                    className="w-full"
                  >
                    Back to Employer Login
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Briefcase className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Employer Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Post jobs and manage your hiring process
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-center space-x-1 mb-4">
              <Button
                type="button"
                variant={authMethod === 'email' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAuthMethod('email')}
                className="flex items-center"
              >
                <Mail className="w-4 h-4 mr-1" />
                Email
              </Button>
              <Button
                type="button"
                variant={authMethod === 'phone' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAuthMethod('phone')}
                className="flex items-center"
              >
                <Phone className="w-4 h-4 mr-1" />
                Phone
              </Button>
            </div>
          </CardHeader>
          
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <CardContent>
                <form onSubmit={handleSignIn} className="space-y-4">
                  {authMethod === 'email' ? (
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="employer@company.com"
                      />
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+254 700 000 000"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <Button 
                      type="button" 
                      variant="link" 
                      className="p-0 h-auto text-sm text-blue-600 hover:underline"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Forgot password?
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>

            <TabsContent value="signup">
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="company_name">Company Name</Label>
                      <Input
                        id="company_name"
                        name="company_name"
                        required
                        value={formData.company_name}
                        onChange={handleInputChange}
                        placeholder="Your Company Ltd"
                      />
                    </div>

                    <div>
                      <Label htmlFor="contact_person">Contact Person</Label>
                      <Input
                        id="contact_person"
                        name="contact_person"
                        required
                        value={formData.contact_person}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  {authMethod === 'email' ? (
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="employer@company.com"
                      />
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+254 700 000 000"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Min 6 characters"
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="text-center text-sm text-gray-600">
          By signing up, you agree to our terms of service and privacy policy.
        </div>
      </div>
    </div>
  );
};

export default EmployerAuth;
