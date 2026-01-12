
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Clock, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { submitContactForm } from '@/utils/secureContactSubmission';
import TrustBadge from '@/components/ui/TrustBadge';
import HowItWorksSteps from '@/components/home/HowItWorksSteps';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionStatus('idle');

    try {
      const result = await submitContactForm(formData);
      
      if (result.success) {
        setSubmissionStatus('success');
        setFormData({ name: '', email: '', message: '', phone: '' });
        toast.success(result.message);
      } else {
        setSubmissionStatus('error');
        toast.error(result.message);
      }
    } catch (error) {
      setSubmissionStatus('error');
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Reset status when user starts typing again
    if (submissionStatus !== 'idle') {
      setSubmissionStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm mb-4">
              <Shield className="h-4 w-4" />
              No login required
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">Get in Touch</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're here to help. Reach out to us for support, questions, or to learn more about our services.
            </p>
          </div>

          {/* How It Works - Compact */}
          <div className="mb-8">
            <HowItWorksSteps variant="compact" />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form - Primary */}
            <div className="md:order-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Send us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                        Full Name *
                      </label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Your full name"
                        required
                        disabled={isSubmitting}
                        maxLength={100}
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="your.email@example.com"
                        required
                        disabled={isSubmitting}
                        maxLength={254}
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">
                        Phone Number (Optional)
                      </label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Optional"
                        disabled={isSubmitting}
                        maxLength={20}
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1">
                        Message *
                      </label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        placeholder="Please describe how we can help you..."
                        rows={5}
                        required
                        disabled={isSubmitting}
                        maxLength={5000}
                        minLength={10}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {formData.message.length}/5000 characters (minimum 10)
                      </p>
                    </div>

                    {submissionStatus === 'success' && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-md">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Thank you for your message! We'll get back to you soon.
                        </p>
                      </div>
                    )}

                    {submissionStatus === 'error' && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md">
                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <p className="text-sm text-red-700 dark:text-red-300">
                          There was an issue submitting your message. Please try again.
                        </p>
                      </div>
                    )}

                    {/* Trust Badge before submit */}
                    <TrustBadge variant="minimal" className="justify-center" />

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isSubmitting || !formData.name || !formData.email || !formData.message}
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information - Secondary */}
            <div className="md:order-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-center">
                    <Mail className="h-5 w-5 text-primary" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Response Time</p>
                      <p className="text-muted-foreground">Within 24 hours</p>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground">
                    We're committed to responding to all inquiries promptly and with care.
                  </p>
                </CardContent>
              </Card>

              {/* Privacy Card */}
              <TrustBadge variant="card" />

              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Crisis Support</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-4">
                    If you're experiencing a crisis or need immediate help, please contact:
                  </p>
                  <div className="space-y-2">
                    <p className="font-medium text-destructive">Emergency: 999 or 112</p>
                    <p className="font-medium">Crisis Helpline: +254 722 178 177</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Other Ways to Connect</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Explore our resources and services while you wait for our response
                  </p>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full" asChild>
                      <a href="/resources">Browse Resources</a>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <a href="/services">Explore Services</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
