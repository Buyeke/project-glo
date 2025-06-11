
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Users, Search, Gift } from 'lucide-react';

const About = () => {
  const team = [
    {
      name: 'Sarah Johnson',
      role: 'Founder & CEO',
      description: 'Former social worker with 15 years of experience helping vulnerable populations.',
    },
    {
      name: 'Dr. Maria Rodriguez',
      role: 'Chief Medical Officer',
      description: 'Pediatrician specializing in trauma-informed care for children and families.',
    },
    {
      name: 'James Chen',
      role: 'Head of Technology',
      description: 'AI researcher focused on developing ethical and accessible technology solutions.',
    },
    {
      name: 'Amanda Williams',
      role: 'Director of Services',
      description: 'Licensed clinical social worker with expertise in crisis intervention.',
    },
  ];

  const values = [
    {
      icon: Heart,
      title: 'Compassion',
      description: 'We approach every interaction with empathy and understanding.',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'We believe in the power of connection and mutual support.',
    },
    {
      icon: Search,
      title: 'Innovation',
      description: 'We leverage technology to create new solutions for old problems.',
    },
    {
      icon: Gift,
      title: 'Empowerment',
      description: 'We focus on building dignity, skills, and independence.',
    },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">About Glo</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Founded in 2023, Glo emerged from a simple yet powerful vision: to create a world where 
            no woman or child faces homelessness alone. We combine compassionate human support with 
            cutting-edge AI technology to provide comprehensive, dignified assistance.
          </p>
        </div>

        {/* Story Section */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Glo was born from the real experiences of women who had navigated homelessness and 
                  emerged stronger. Our founder, Sarah Johnson, spent years working in traditional 
                  shelters and saw firsthand how fragmented services and lack of personalized support 
                  left many women and children falling through the cracks.
                </p>
                <p>
                  The breakthrough came when we realized that artificial intelligence could serve as 
                  a bridge - not replacing human connection, but enhancing it. Our AI assistant provides 
                  24/7 support, instantly connecting users with the exact resources they need, while 
                  our human team focuses on building relationships and providing specialized care.
                </p>
                <p>
                  Today, Glo serves as more than a service provider - we're a community, a lifeline, 
                  and a launchpad for new beginnings.
                </p>
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg p-8">
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-gray-700 mb-6">
                To empower homeless women and children through AI-enhanced support services, 
                community connection, and comprehensive resources that foster independence, 
                dignity, and lasting positive change.
              </p>
              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-gray-700">
                A world where every woman and child has access to safe housing, meaningful 
                employment, and the support they need to thrive - powered by technology 
                and human compassion working in harmony.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <value.icon className="h-12 w-12 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{value.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Team</h2>
            <p className="text-xl text-gray-600">Dedicated professionals committed to making a difference</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="w-20 h-20 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-foreground">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <CardTitle className="text-lg text-center">{member.name}</CardTitle>
                  <CardDescription className="text-center text-primary font-medium">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 text-center">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Partners Section */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Partners</h2>
            <p className="text-xl text-gray-600">Working together to create lasting change</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <h3 className="text-lg font-semibold mb-2">Shelter Network Partners</h3>
                <p className="text-gray-600">50+ emergency shelters and transitional housing facilities</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Healthcare Partners</h3>
                <p className="text-gray-600">Local hospitals, clinics, and mental health providers</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Employment Partners</h3>
                <p className="text-gray-600">100+ employers committed to inclusive hiring practices</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
