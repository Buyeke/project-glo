
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
    <div className="min-h-screen bg-background">
      {/* Hero Section - 2 Column Layout */}
      <section className="hero-gradient py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight">
                  Empowering Women & Children
                </h1>
                <p className="text-xl md:text-2xl text-foreground/80 leading-relaxed max-w-2xl">
                  AI-powered support for homeless women and children in Mombasa — access shelter, food, healthcare, and more.
                </p>
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-sm border">
                  <p className="text-lg font-medium text-primary mb-2">
                    You're not alone. Glo connects you to real help, fast.
                  </p>
                  <div className="flex items-start gap-2 text-sm text-foreground/70">
                    <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Serving Mombasa County (In-person & Virtual Services Available)</p>
                      <p className="mt-1">Once your registration is confirmed, we will send you a personalized virtual meeting link via email or WhatsApp within 24 hours.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300" asChild>
                  <Link to="/auth">Get Support Now</Link>
                </Button>
              </div>
            </div>

            {/* Right Column - Image Placeholder */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                {/* Using a placeholder image that represents support and community */}
                <div className="w-80 h-80 lg:w-96 lg:h-96 rounded-2xl bg-gradient-to-br from-secondary/10 to-accent/10 flex items-center justify-center border-2 border-white shadow-2xl">
                  <div className="text-center space-y-4 p-8">
                    <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                      <Heart className="w-12 h-12 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-primary">Community Support</p>
                      <p className="text-sm text-foreground/70">Together we build stronger futures</p>
                    </div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-accent rounded-full opacity-60"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-success rounded-full opacity-60"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Our Impact</h2>
            <p className="text-xl text-foreground/70">Making a real difference in our community</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center hover-accent p-6 rounded-lg">
                <div className="flex justify-center mb-4">
                  <stat.icon className="h-12 w-12 text-secondary" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-foreground/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore Support Areas Section */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Explore Support Areas</h2>
            <p className="text-xl text-foreground/70">Comprehensive support for every need</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 bg-white border-0 hover-accent">
                <CardHeader className="pb-4">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-secondary/10 rounded-full">
                      <service.icon className="h-8 w-8 text-secondary" />
                    </div>
                  </div>
                  <CardTitle className="text-lg text-primary">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-foreground/70">{service.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300" asChild>
              <Link to="/services">View All Services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Partner Organizations */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-primary mb-4">Partner Organizations</h3>
            <p className="text-foreground/70 mb-6">
              We are currently partnered with two NGOs in Mombasa. More trusted support providers coming soon.
            </p>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-6 w-6 text-success" />
              <span className="text-lg font-semibold text-primary">Trusted by 12+ local shelters</span>
            </div>
            <p className="text-foreground/70 flex items-center justify-center gap-2">
              <MapPin className="h-4 w-4" />
              Serving Mombasa County and surrounding areas
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Whether you need support or want to help others, we're here for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white shadow-lg" asChild>
              <Link to="/auth">Join Our Community</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary transition-all duration-300" asChild>
              <Link to="/resources">Browse Resources</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Join Network CTA */}
      <section className="py-12 bg-gradient-to-r from-success to-accent text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-lg font-medium mb-4">
              Are you a therapist, legal expert, or NGO who wants to help?
            </p>
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg" asChild>
              <Link to="/auth">Join Our Network</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
