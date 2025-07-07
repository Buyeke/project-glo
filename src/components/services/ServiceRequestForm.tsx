
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useDataTracking } from '@/hooks/useDataTracking';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import TextToSpeech from '@/components/TextToSpeech';

const ServiceRequestForm = () => {
  const [serviceType, setServiceType] = useState('');
  const [language, setLanguage] = useState('english');
  const [priority, setPriority] = useState('medium');
  const [description, setDescription] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { trackServiceRequest } = useDataTracking();
  const { user } = useAuth();

  const serviceTypes = [
    { value: 'shelter', label: 'Emergency Shelter' },
    { value: 'legal aid', label: 'Legal Aid' },
    { value: 'mental health', label: 'Mental Health Support' },
    { value: 'job placement', label: 'Job Placement' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'food assistance', label: 'Food Assistance' },
    { value: 'childcare', label: 'Childcare Support' },
    { value: 'education', label: 'Educational Support' },
  ];

  const languages = [
    { value: 'english', label: 'English' },
    { value: 'kiswahili', label: 'Kiswahili' },
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!serviceType) {
      toast.error('Please select a service type');
      return;
    }

    if (!isAnonymous && !userEmail) {
      toast.error('Please provide your email address or select anonymous option');
      return;
    }

    if (!isAnonymous && !phoneNumber) {
      toast.error('Please provide your phone number or WhatsApp number or select anonymous option');
      return;
    }

    setIsSubmitting(true);
    try {
      // Generate temporary ID for anonymous users
      const tempId = isAnonymous ? `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : null;
      
      // Submit to support_requests table
      const { error } = await supabase
        .from('support_requests')
        .insert({
          user_email: isAnonymous ? tempId : userEmail,
          service_type: serviceType,
          language: language,
          priority: priority,
          message: description || null,
          phone_number: isAnonymous ? 'anonymous' : phoneNumber,
          status: 'awaiting_confirmation'
        });

      if (error) throw error;

      // Track the request if user is logged in
      if (user) {
        await trackServiceRequest(serviceType, language);
      }

      if (isAnonymous) {
        toast.success(`Support request submitted anonymously! Your temporary ID is: ${tempId}. Save this for reference. We'll reach out using this ID.`);
      } else {
        toast.success('Support request submitted successfully! You will receive your personalized meeting link within 24 hours.');
      }
      
      // Reset form
      setServiceType('');
      setDescription('');
      setUserEmail('');
      setPhoneNumber('');
      setPriority('medium');
      setIsAnonymous(false);
    } catch (error) {
      console.error('Error submitting support request:', error);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Request Support</CardTitle>
          <TextToSpeech text="Request Support" />
        </div>
        <div className="flex items-start gap-2">
          <CardDescription className="flex-1">
            Tell us what kind of support you need and we'll connect you with the right resources in Mombasa
          </CardDescription>
          <TextToSpeech text="Tell us what kind of support you need and we'll connect you with the right resources in Mombasa" />
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Service Type *
              </label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((service) => (
                    <SelectItem key={service.value} value={service.value}>
                      {service.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Preferred Language *
              </label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
            />
            <label
              htmlFor="anonymous"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I want to remain anonymous
            </label>
          </div>

          {isAnonymous && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                We'll still reach out using a temporary ID. Your information will remain confidential.
              </p>
            </div>
          )}

          {!isAnonymous && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Your Email *
                </label>
                <Input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required={!isAnonymous}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  WhatsApp or Phone Number *
                </label>
                <Input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+254 7XX XXX XXX"
                  required={!isAnonymous}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              Priority Level
            </label>
            <div className="flex gap-2">
              {priorities.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    priority === p.value 
                      ? p.color 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-sm font-medium">
                Additional Details (Optional)
              </label>
              <TextToSpeech text="Please provide any additional information that might help us assist you better" />
            </div>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide any additional information that might help us assist you better..."
              className="min-h-[100px]"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-xl">⏰</div>
              <div className="flex-1">
                <p className="font-medium text-blue-800 mb-1">Status: Awaiting Confirmation</p>
                <div className="flex items-start gap-2">
                  <p className="text-sm text-blue-700 flex-1">
                    You will receive your personalized virtual meeting link via email or WhatsApp within 24 hours.
                  </p>
                  <TextToSpeech text="You will receive your personalized virtual meeting link via email or WhatsApp within 24 hours." />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-xl">🔒</div>
              <div className="flex-1">
                <div className="flex items-start gap-2">
                  <p className="text-sm text-green-800 flex-1">
                    Your information is confidential and only shared with the organizations providing your support.
                  </p>
                  <TextToSpeech text="Your information is confidential and only shared with the organizations providing your support." />
                </div>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || !serviceType || (!isAnonymous && (!userEmail || !phoneNumber))}
          >
            {isSubmitting ? 'Submitting Request...' : 'Submit Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ServiceRequestForm;
