
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Users, Home as HomeIcon, Search, Gift, Shield, MapPin, Calendar } from 'lucide-react';

const Home = () => {
  const stats = [
    { number: '50+', label: 'Women Supported', icon: Users },
    { number: '100+', label: 'Children Helped', icon: Heart },
    { number: '12+', label: 'Trusted Partners', icon: HomeIcon },
    { number: '24/7', label: 'AI Support', icon: Search },
  ];

  const services = [
    {
      title: 'Emergency Shelter',
      description: 'Immediate safe housing and emergency accommodation',
      icon: HomeIcon,
    },
    {
      title: 'Job Placement',
      description: 'Employment opportunities and career development',
      icon: Search,
    },
    {
      title: 'Mental Health Support',
      description: 'Counseling, therapy, and emotional wellbeing services',
      icon: Heart,
    },
    {
      title: 'AI-Powered Guidance',
      description: '24/7 intelligent assistance and resource matching',
      icon: Search,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Empowering Women & Children
            </h1>
            <p className="text-xl md:text-2xl mb-4 max-w-4xl mx-auto">
              AI-powered support for homeless women and children in Mombasa — access shelter, food, healthcare, and more.
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6 max-w-2xl mx-auto">
              <p className="text-lg font-medium">
                You're not alone. Glo connects you to real help, fast.
              </p>
            </div>
            <div className="bg-blue-50/20 backdrop-blur-sm rounded-lg p-4 mb-8 max-w-3xl mx-auto">
              <p className="text-base font-medium">
                📍 Serving Mombasa County (In-person & Virtual Services Available)
              </p>
              <p className="text-sm mt-2">
                Once your registration is confirmed, we will send you a personalized virtual meeting link via email or WhatsApp within 24 hours.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/auth">Get Support Now</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-purple-600" asChild>
                <Link to="/donate">Make a Donation</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Impact</h2>
            <p className="text-xl text-gray-600">Making a real difference in our community</p>
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

      {/* Services Overview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600">Comprehensive support for every need</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <service.icon className="h-12 w-12 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{service.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild>
              <Link to="/services">View All Services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Partner Organizations */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Partner Organizations</h3>
            <p className="text-gray-600 mb-6">
              We are currently partnered with two NGOs in Mombasa. More trusted support providers coming soon.
            </p>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-6 w-6 text-green-600" />
              <span className="text-lg font-semibold text-gray-900">Trusted by 12+ local shelters</span>
            </div>
            <p className="text-gray-600 flex items-center justify-center gap-2">
              <MapPin className="h-4 w-4" />
              Serving Mombasa County and surrounding areas
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Whether you need support or want to help others, we're here for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/auth">Join Our Community</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary" asChild>
              <Link to="/resources">Browse Resources</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Join Network CTA */}
      <section className="py-8 bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-lg font-medium mb-4">
              Are you a therapist, legal expert, or NGO who wants to help?
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/auth">Join Our Network</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
