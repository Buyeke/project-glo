
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Home, Users, Briefcase, GraduationCap, Heart, Search, HandHeart, BookOpen } from 'lucide-react';

const Services = () => {
  const services = [
    {
      title: 'Shelter Access',
      description: 'Safe housing and essential resources through partner facilities',
      icon: Home,
      features: [
        'Emergency shelter placement',
        'Safe, secure accommodations',
        'Essential supplies and amenities',
        'Temporary and transitional housing',
        '24/7 support and security'
      ]
    },
    {
      title: 'Personalized Referrals',
      description: 'AI-powered matching connects users to NGOs and community services for mental health, addiction recovery, and health care',
      icon: Search,
      features: [
        'AI-powered service matching',
        'Mental health referrals',
        'Addiction recovery programs',
        'Healthcare connections',
        'Community service coordination'
      ]
    },
    {
      title: 'Job & Skills Support',
      description: 'Training programs and links to employment opportunities to foster independence',
      icon: Briefcase,
      features: [
        'Skills assessment and training',
        'Resume building workshops',
        'Interview preparation',
        'Job placement assistance',
        'Career development planning'
      ]
    },
    {
      title: 'Education & Life Skills',
      description: 'Workshops on financial literacy, parenting, and wellness',
      icon: GraduationCap,
      features: [
        'Financial literacy training',
        'Parenting workshops',
        'Health and wellness education',
        'Digital literacy classes',
        'Life skills development'
      ]
    },
    {
      title: 'Community Integration',
      description: 'Pathways to housing, legal aid, and social reintegration',
      icon: Users,
      features: [
        'Permanent housing assistance',
        'Legal aid connections',
        'Social reintegration support',
        'Community networking',
        'Long-term stability planning'
      ]
    }
  ];

  const stats = [
    { number: '50+', label: 'Women Supported', icon: Users },
    { number: '100+', label: 'Children Helped', icon: Heart },
    { number: '10+', label: 'Shelter Partners', icon: Home },
    { number: '24/7', label: 'AI Support', icon: Search },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Comprehensive Support Services
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Empowering homeless women and children with AI-powered support, 
              resources, and pathways to independence and stability.
            </p>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Impact So Far</h2>
            <p className="text-xl text-gray-600">Making a difference one person at a time</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <stat.icon className="h-12 w-12 text-primary" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600">Comprehensive support for every stage of your journey</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <service.icon className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{service.title}</CardTitle>
                      <CardDescription className="mt-2">{service.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How Glo Works</h2>
            <p className="text-xl text-gray-600">Your journey to independence starts here</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect</h3>
              <p className="text-gray-600">
                Reach out through our AI chatbot or contact our support team to begin your journey.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Match</h3>
              <p className="text-gray-600">
                Our AI system matches you with the most relevant services and support resources.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Thrive</h3>
              <p className="text-gray-600">
                Access comprehensive support and build the skills needed for independence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Support?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Take the first step towards independence and stability. Our team is here to help you access the resources you need.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/auth">Get Started Today</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary" asChild>
              <Link to="/resources">Browse Resources</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
