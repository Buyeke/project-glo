
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Users, Home as HomeIcon, Search, Shield, MapPin, Sun, Moon } from 'lucide-react';

const Home = () => {
  const [calmMode, setCalmMode] = useState(false);

  const toggleCalmMode = () => {
    setCalmMode(!calmMode);
    document.documentElement.classList.toggle('calm-mode');
  };

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
      {/* Calm Mode Toggle */}
      <div className="fixed top-20 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleCalmMode}
          className="bg-card border-border text-foreground hover:bg-muted"
        >
          {calmMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          <span className="ml-2 text-xs">{calmMode ? 'Normal' : 'Calm'} Mode</span>
        </Button>
      </div>

      {/* Hero Section - Professional and warm */}
      <section className="hero-calm py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight animate-soft-fade">
                  Empowering Women & Children
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed animate-soft-fade-delay">
                  GLO is an AI-powered safety net for women and children—offering multilingual support, dignity, and hope.
                </p>
                <div className="bg-card rounded-lg p-6 border border-border animate-soft-fade-delay">
                  <p className="text-base font-medium text-foreground mb-3">
                    You're not alone. Glo connects you to real help, fast.
                  </p>
                  <div className="flex items-start gap-3 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-1 flex-shrink-0 text-secondary" />
                    <div>
                      <p className="font-medium">Serving Mombasa County (In-person & Virtual Services Available)</p>
                      <p className="mt-2">Once your registration is confirmed, we will send you a personalized virtual meeting link via email or WhatsApp within 24 hours.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 animate-soft-fade-delay-2">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-base rounded-lg font-semibold" 
                  asChild
                >
                  <Link to="/auth">Request Support</Link>
                </Button>
              </div>
            </div>

            {/* Right Column - Professional Hero Visual */}
            <div className="flex justify-center lg:justify-end animate-soft-fade-delay">
              <div className="relative">
                <div className="w-80 h-80 lg:w-96 lg:h-96 rounded-2xl bg-card border border-border flex items-center justify-center shadow-lg">
                  <div className="text-center space-y-6 p-8">
                    <div className="w-24 h-24 mx-auto bg-secondary/20 rounded-full flex items-center justify-center">
                      <Heart className="w-12 h-12 text-secondary" />
                    </div>
                    <div className="space-y-3">
                      <p className="text-xl font-semibold text-foreground">Community Support</p>
                      <p className="text-base text-muted-foreground">Together we build stronger futures</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider"></div>

      {/* About Us Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="bg-card border-border shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">About GLO</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base text-muted-foreground leading-relaxed">
                GLO is a project using AI to deliver trauma-informed care, housing, and support to women and children in need. 
                We connect vulnerable individuals with trusted local organizations through intelligent matching and multilingual support.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider"></div>

      {/* Stats Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Impact</h2>
            <p className="text-lg text-muted-foreground">Making a real difference in our community</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center hover-gentle p-6 rounded-lg bg-card border border-border">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-secondary/20 rounded-full">
                    <stat.icon className="h-8 w-8 text-secondary" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">{stat.number}</div>
                <div className="text-muted-foreground text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider"></div>

      {/* Explore Support Areas Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Explore Support Areas</h2>
            <p className="text-lg text-muted-foreground">Comprehensive support for every need</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="text-center hover-gentle bg-card border-border shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-secondary/20 rounded-full">
                      <service.icon className="h-8 w-8 text-secondary" />
                    </div>
                  </div>
                  <CardTitle className="text-lg text-foreground">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground text-sm">{service.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              className="border-border text-foreground hover:bg-muted px-6 py-3 rounded-lg" 
              asChild
            >
              <Link to="/services">View All Services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider"></div>

      {/* Partner Organizations */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">Partner Organizations</h3>
            <p className="text-muted-foreground mb-6 text-base">
              We are currently partnered with two NGOs in Mombasa. More trusted support providers coming soon.
            </p>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-full">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-lg font-semibold text-foreground">Trusted by 12+ local shelters</span>
            </div>
            <p className="text-muted-foreground flex items-center justify-center gap-2">
              <MapPin className="h-4 w-4 text-secondary" />
              Serving Mombasa County and surrounding areas
            </p>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider"></div>

      {/* Call to Action - Professional Purple/Pink Gradient */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Whether you need support or want to help others, we're here for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 px-8 py-3 rounded-lg font-semibold" 
              asChild
            >
              <Link to="/auth">Join Our Community</Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-transparent border-white text-white hover:bg-white/10 px-8 py-3 rounded-lg font-semibold" 
              asChild
            >
              <Link to="/resources">Browse Resources</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Join Network CTA - Professional Secondary Color */}
      <section className="py-12 bg-secondary text-secondary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-lg font-medium mb-4">
              Are you a therapist, legal expert, or NGO who wants to help?
            </p>
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-lg font-semibold" 
              asChild
            >
              <Link to="/auth">Join Our Network</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
