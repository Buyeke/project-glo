
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useDataTracking } from '@/hooks/useDataTracking';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const ServiceRequestForm = () => {
  const [serviceType, setServiceType] = useState('');
  const [language, setLanguage] = useState('english');
  const [priority, setPriority] = useState('medium');
  const [description, setDescription] = useState('');
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
    { value: 'swahili', label: 'Swahili' },
    { value: 'arabic', label: 'Arabic' },
    { value: 'sheng', label: 'Sheng' },
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to submit a request');
      return;
    }

    if (!serviceType) {
      toast.error('Please select a service type');
      return;
    }

    setIsSubmitting(true);
    try {
      await trackServiceRequest(serviceType, language);
      toast.success('Service request submitted successfully! We will get back to you soon.');
      
      // Reset form
      setServiceType('');
      setDescription('');
      setPriority('medium');
    } catch (error) {
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Service Request</CardTitle>
          <CardDescription>
            Please sign in to submit a service request
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <a href="/auth">Sign In</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Request Support</CardTitle>
        <CardDescription>
          Tell us what kind of support you need and we'll connect you with the right resources
        </CardDescription>
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
                Preferred Language
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
            <label className="block text-sm font-medium mb-2">
              Additional Details (Optional)
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide any additional information that might help us assist you better..."
              className="min-h-[100px]"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || !serviceType}
          >
            {isSubmitting ? 'Submitting Request...' : 'Submit Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ServiceRequestForm;
