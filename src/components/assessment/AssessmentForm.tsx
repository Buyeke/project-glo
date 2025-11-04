
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Shield, Heart, Home } from 'lucide-react';
import { useAssessment } from '@/hooks/useAssessment';
import { detectEmergency, getEmergencyServices } from '@/utils/emergencyDetection';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AssessmentForm = () => {
  const { createAssessment, isCreatingAssessment, getAssessmentStatus } = useAssessment();
  const [formData, setFormData] = useState({
    need_types: [] as string[],
    urgency_level: 'medium' as 'high' | 'medium' | 'low',
    language_preference: 'english',
    location_data: { region: '', address: '' },
    vulnerability_tags: [] as string[],
    literacy_mode: 'text' as 'text' | 'voice_first' | 'icon_based',
    assessment_responses: {} as Record<string, any>,
  });

  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);

  const needTypes = [
    { id: 'shelter', label: 'Emergency Shelter', icon: Home },
    { id: 'mental_health', label: 'Mental Health Support', icon: Heart },
    { id: 'food', label: 'Food Assistance', icon: Heart },
    { id: 'legal_aid', label: 'Legal Aid', icon: Shield },
    { id: 'childcare', label: 'Childcare Support', icon: Heart },
    { id: 'healthcare', label: 'Healthcare', icon: Heart },
  ];

  const vulnerabilityTags = [
    { id: 'gbv_survivor', label: 'GBV Survivor' },
    { id: 'pregnant', label: 'Pregnant' },
    { id: 'teen_mother', label: 'Teen Mother' },
    { id: 'minor', label: 'Minor (Under 18)' },
    { id: 'disabled', label: 'Person with Disability' },
  ];

  const handleNeedTypeChange = (needType: string, checked: boolean) => {
    const updatedNeeds = checked 
      ? [...formData.need_types, needType]
      : formData.need_types.filter(type => type !== needType);
    
    setFormData(prev => ({ ...prev, need_types: updatedNeeds }));
  };

  const handleVulnerabilityChange = (tag: string, checked: boolean) => {
    const updatedTags = checked 
      ? [...formData.vulnerability_tags, tag]
      : formData.vulnerability_tags.filter(t => t !== tag);
    
    setFormData(prev => ({ ...prev, vulnerability_tags: updatedTags }));
  };

  const handleResponseChange = (key: string, value: any) => {
    const updatedResponses = { ...formData.assessment_responses, [key]: value };
    setFormData(prev => ({ 
      ...prev, 
      assessment_responses: updatedResponses 
    }));

    // Check for emergency indicators
    if (detectEmergency(updatedResponses)) {
      setShowEmergencyAlert(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.need_types.length === 0) {
      alert('Please select at least one need type.');
      return;
    }

    createAssessment(formData);
  };

  const { status, message } = getAssessmentStatus();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-pink-600" />
            Needs Assessment
          </CardTitle>
          <CardDescription>
            Help us understand your needs so we can connect you with the right services.
            {status === 'pending' && (
              <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
                {message}
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showEmergencyAlert && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Emergency Support Available</strong>
                <div className="mt-2 space-y-1">
                  {getEmergencyServices().map(service => (
                    <div key={service.number} className="text-sm">
                      <strong>{service.name}:</strong> {service.number} - {service.description}
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="language">Preferred Language</Label>
                  <Select 
                    value={formData.language_preference} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, language_preference: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="swahili">Kiswahili</SelectItem>
                      <SelectItem value="arabic">العربية (Arabic)</SelectItem>
                      <SelectItem value="sheng">Sheng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="region">Region/Area</Label>
                  <Input
                    id="region"
                    value={formData.location_data.region}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      location_data: { ...prev.location_data, region: e.target.value }
                    }))}
                    placeholder="e.g., Nairobi, Kisumu, Nakuru"
                  />
                </div>
              </div>
            </div>

            {/* Needs Assessment */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">What kind of support do you need?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {needTypes.map(({ id, label, icon: Icon }) => (
                  <div key={id} className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Checkbox
                      id={id}
                      checked={formData.need_types.includes(id)}
                      onCheckedChange={(checked) => handleNeedTypeChange(id, checked as boolean)}
                    />
                    <Icon className="h-4 w-4 text-gray-600" />
                    <Label htmlFor={id} className="flex-1 cursor-pointer">{label}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Urgency Level */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">How urgent is your need for support?</h3>
              <RadioGroup 
                value={formData.urgency_level} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, urgency_level: value as any }))}
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high" className="flex-1 cursor-pointer">
                    <span className="font-medium text-red-600">High - I need help immediately</span>
                    <p className="text-sm text-gray-600">Emergency situation requiring immediate assistance</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium" className="flex-1 cursor-pointer">
                    <span className="font-medium text-orange-600">Medium - I need help within a few days</span>
                    <p className="text-sm text-gray-600">Situation that needs attention soon</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low" className="flex-1 cursor-pointer">
                    <span className="font-medium text-green-600">Low - I can wait for the right opportunity</span>
                    <p className="text-sm text-gray-600">Planning ahead for future needs</p>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Vulnerability Tags */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Additional Information (Optional)</h3>
              <p className="text-sm text-gray-600">This helps us connect you with specialized services</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vulnerabilityTags.map(({ id, label }) => (
                  <div key={id} className="flex items-center space-x-2">
                    <Checkbox
                      id={id}
                      checked={formData.vulnerability_tags.includes(id)}
                      onCheckedChange={(checked) => handleVulnerabilityChange(id, checked as boolean)}
                    />
                    <Label htmlFor={id} className="cursor-pointer">{label}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Tell us more about your situation</h3>
              <Textarea
                value={formData.assessment_responses.additional_details || ''}
                onChange={(e) => handleResponseChange('additional_details', e.target.value)}
                placeholder="Please share any additional details that would help us understand your needs better..."
                className="min-h-24"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isCreatingAssessment || formData.need_types.length === 0}
            >
              {isCreatingAssessment ? 'Processing Assessment...' : 'Submit Assessment'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssessmentForm;
