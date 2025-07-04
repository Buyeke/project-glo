
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
      {/* Hero Section - Enhanced with emotional warmth */}
      <section className="hero-gradient py-24 lg:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Content with animations */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary leading-tight animate-fade-in">
                  Empowering Women & Children
                </h1>
                <p className="text-xl md:text-2xl text-primary/80 leading-relaxed font-medium animate-fade-in-delay">
                  GLO is an AI-powered safety net for women and children—offering multilingual support, dignity, and hope.
                </p>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-white/20 animate-fade-in-delay">
                  <p className="text-lg font-semibold text-primary mb-3">
                    You're not alone. Glo connects you to real help, fast.
                  </p>
                  <div className="flex items-start gap-3 text-sm text-primary/70">
                    <MapPin className="h-5 w-5 mt-1 flex-shrink-0 text-secondary" />
                    <div>
                      <p className="font-medium">Serving Mombasa County (In-person & Virtual Services Available)</p>
                      <p className="mt-2">Once your registration is confirmed, we will send you a personalized virtual meeting link via email or WhatsApp within 24 hours.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 animate-fade-in-delay-2">
                <Button 
                  size="lg" 
                  className="bg-secondary hover:bg-secondary/90 text-white px-10 py-6 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105" 
                  asChild
                >
                  <Link to="/auth">Get Support Now</Link>
                </Button>
              </div>
            </div>

            {/* Right Column - Enhanced Hero Image */}
            <div className="flex justify-center lg:justify-end animate-fade-in-delay">
              <div className="relative">
                <div className="w-96 h-96 lg:w-[28rem] lg:h-[28rem] rounded-3xl bg-gradient-to-br from-secondary/20 via-accent/20 to-primary/10 flex items-center justify-center border-4 border-white/50 shadow-2xl backdrop-blur-sm">
                  <div className="text-center space-y-6 p-10">
                    <div className="w-32 h-32 mx-auto bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Heart className="w-16 h-16 text-secondary" />
                    </div>
                    <div className="space-y-3">
                      <p className="text-2xl font-bold text-primary">Community Support</p>
                      <p className="text-lg text-primary/80 font-medium">Together we build stronger futures</p>
                    </div>
                  </div>
                </div>
                
                {/* Decorative floating elements */}
                <div className="absolute -top-6 -right-6 w-12 h-12 bg-accent/60 rounded-full blur-sm animate-pulse"></div>
                <div className="absolute -bottom-6 -left-6 w-8 h-8 bg-secondary/60 rounded-full blur-sm animate-pulse delay-300"></div>
                <div className="absolute top-1/2 -left-8 w-6 h-6 bg-primary/40 rounded-full blur-sm animate-pulse delay-700"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider"></div>

      {/* Stats Section */}
      <section className="py-20 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary mb-6">Our Impact</h2>
            <p className="text-xl text-primary/70 font-medium">Making a real difference in our community</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center hover-accent p-8 rounded-xl bg-white/60 backdrop-blur-sm border border-white/30">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-secondary/10 rounded-full">
                    <stat.icon className="h-12 w-12 text-secondary" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-primary mb-3">{stat.number}</div>
                <div className="text-primary/70 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider"></div>

      {/* Explore Support Areas Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-primary mb-6">Explore Support Areas</h2>
            <p className="text-xl text-primary/70 font-medium">Comprehensive support for every need</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="text-center hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-white/30 hover-accent rounded-xl">
                <CardHeader className="pb-4">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 bg-secondary/10 rounded-full">
                      <service.icon className="h-10 w-10 text-secondary" />
                    </div>
                  </div>
                  <CardTitle className="text-xl text-primary font-semibold">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-primary/70 font-medium">{service.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-16">
            <Button 
              variant="outline" 
              className="border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 px-8 py-3 text-lg rounded-xl font-semibold" 
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
      <section className="py-20 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-primary mb-6">Partner Organizations</h3>
            <p className="text-primary/70 mb-8 text-lg font-medium">
              We are currently partnered with two NGOs in Mombasa. More trusted support providers coming soon.
            </p>
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-full">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <span className="text-xl font-bold text-primary">Trusted by 12+ local shelters</span>
            </div>
            <p className="text-primary/70 flex items-center justify-center gap-2 font-medium">
              <MapPin className="h-5 w-5 text-secondary" />
              Serving Mombasa County and surrounding areas
            </p>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider"></div>

      {/* Call to Action */}
      <section className="py-20 bg-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/90"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-10 max-w-3xl mx-auto opacity-90 font-medium">
            Whether you need support or want to help others, we're here for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              size="lg" 
              className="bg-secondary hover:bg-secondary/90 text-white shadow-xl px-10 py-4 text-lg rounded-xl font-semibold transform hover:scale-105 transition-all duration-300" 
              asChild
            >
              <Link to="/auth">Join Our Community</Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary transition-all duration-300 px-10 py-4 text-lg rounded-xl font-semibold" 
              asChild
            >
              <Link to="/resources">Browse Resources</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Join Network CTA */}
      <section className="py-16 bg-gradient-to-r from-secondary to-accent text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xl font-semibold mb-6">
              Are you a therapist, legal expert, or NGO who wants to help?
            </p>
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 shadow-xl px-10 py-4 text-lg rounded-xl font-semibold transform hover:scale-105 transition-all duration-300" 
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
