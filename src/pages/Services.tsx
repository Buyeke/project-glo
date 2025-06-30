
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Home, Briefcase, Scale, Stethoscope, GraduationCap, Baby, Utensils } from 'lucide-react';
import ServiceRequestForm from '@/components/services/ServiceRequestForm';
import { usePageTracking } from '@/hooks/useDataTracking';

const Services = () => {
  usePageTracking();

  const services = [
    {
      icon: Home,
      title: 'Emergency Shelter',
      description: 'Immediate safe housing and emergency accommodation for women and children in need.',
      features: ['24/7 availability', 'Safe environment', 'Temporary housing', 'Crisis intervention'],
      availability: 'Available',
    },
    {
      icon: Scale,
      title: 'Legal Aid',
      description: 'Legal assistance for housing rights, family law, and other legal matters.',
      features: ['Housing rights', 'Family law', 'Legal consultation', 'Court representation'],
      availability: 'Available',
    },
    {
      icon: Heart,
      title: 'Mental Health Support',
      description: 'Counseling, therapy, and emotional support services for trauma recovery.',
      features: ['Individual counseling', 'Group therapy', 'Trauma recovery', 'Crisis support'],
      availability: 'Available',
    },
    {
      icon: Briefcase,
      title: 'Job Placement',
      description: 'Employment opportunities, skills training, and career development support.',
      features: ['Job matching', 'Skills training', 'Interview preparation', 'Career guidance'],
      availability: 'Available',
    },
    {
      icon: Stethoscope,
      title: 'Healthcare',
      description: 'Basic healthcare services, maternal health support, and wellness programs.',
      features: ['Primary care', 'Maternal health', 'Health screenings', 'Wellness education'],
      availability: 'Available',
    },
    {
      icon: GraduationCap,
      title: 'Educational Support',
      description: 'School enrollment assistance and educational resources for children.',
      features: ['School enrollment', 'Educational materials', 'Tutoring support', 'Adult education'],
      availability: 'Available',
    },
    {
      icon: Baby,
      title: 'Childcare Support',
      description: 'Childcare services and parenting support for mothers in need.',
      features: ['Daycare services', 'Parenting classes', 'Child development', 'Family support'],
      availability: 'Limited',
    },
    {
      icon: Utensils,
      title: 'Food Assistance',
      description: 'Nutritional support and food security programs for families.',
      features: ['Food distribution', 'Nutrition education', 'Meal programs', 'Emergency food aid'],
      availability: 'Available',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive support services designed to help homeless women and children rebuild their lives with dignity and hope.
          </p>
        </div>

        {/* Service Request Form */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Support</h2>
            <p className="text-gray-600">
              Need help? Fill out the form below and we'll connect you with the right resources.
            </p>
          </div>
          <ServiceRequestForm />
        </div>

        {/* Services Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Available Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <service.icon className="h-10 w-10 text-primary" />
                    <Badge 
                      variant={service.availability === 'Available' ? 'default' : 'secondary'}
                      className={service.availability === 'Available' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {service.availability}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription className="text-base">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-gray-700">Key Features:</h4>
                    <ul className="space-y-1">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Emergency Support</h2>
            <p className="text-lg mb-6">
              If you need immediate assistance or are in crisis, don't wait. Reach out now.
            </p>
            <div className="space-y-4">
              <Button size="lg" variant="secondary">
                Call Emergency Hotline: 911
              </Button>
              <p className="text-sm opacity-90">
                Available 24/7 for immediate crisis support and emergency services
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Services;
