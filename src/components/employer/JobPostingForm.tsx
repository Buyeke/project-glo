
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, MapPin, Clock, DollarSign } from 'lucide-react';
import { useContentValue } from '@/hooks/useSiteContent';

interface JobPostingFormProps {
  employerProfile: any;
  onSubmit: (jobData: any) => void;
  onCancel: () => void;
}

const JobPostingForm: React.FC<JobPostingFormProps> = ({ employerProfile, onSubmit, onCancel }) => {
  const jobPrice = useContentValue('employer_job_price', { text: '$30' })?.text;
  const jobDuration = useContentValue('employer_job_duration', { text: '30 days' })?.text;
  const [formData, setFormData] = useState({
    title: '',
    job_type: '',
    pay_amount: '',
    location: '',
    job_date: '',
    job_time: '',
    description: '',
    gender_preference: 'any'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const jobData = {
        ...formData,
        pay_amount: parseFloat(formData.pay_amount),
        employer_id: employerProfile?.id
      };

      onSubmit(jobData);
    } catch (error) {
      console.error('Error preparing job data:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Button variant="ghost" onClick={onCancel} className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>
              <p className="text-gray-600">Fill out the form below to create your job listing</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {/* Job Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Job Details
                </CardTitle>
                <CardDescription>
                  Provide basic information about the job position
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., House Cleaner, Security Guard, Driver"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="job_type">Job Type *</Label>
                    <Select onValueChange={(value) => handleSelectChange('job_type', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one-time">One-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="full-time">Full-time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="pay_amount">Pay Amount (KES) *</Label>
                    <Input
                      id="pay_amount"
                      name="pay_amount"
                      type="number"
                      required
                      value={formData.pay_amount}
                      onChange={handleInputChange}
                      placeholder="5000"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="location"
                        name="location"
                        required
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="e.g., City name or region"
                        className="mt-1 pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="gender_preference">Gender Preference</Label>
                    <Select 
                      value={formData.gender_preference} 
                      onValueChange={(value) => handleSelectChange('gender_preference', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the job responsibilities, requirements, and any other relevant details..."
                    className="mt-1 min-h-32"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Schedule (Optional)
                </CardTitle>
                <CardDescription>
                  Specify when the job should be done
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="job_date">Job Date</Label>
                    <Input
                      id="job_date"
                      name="job_date"
                      type="date"
                      value={formData.job_date}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="job_time">Job Time</Label>
                    <Input
                      id="job_time"
                      name="job_time"
                      type="time"
                      value={formData.job_time}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Info */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-blue-900">Job Listing Price</h3>
                  <p className="text-3xl font-bold text-blue-600">{jobPrice} USD</p>
                  <p className="text-sm text-blue-700">
                    Your job will be live for {jobDuration}.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Continue to Payment'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobPostingForm;
