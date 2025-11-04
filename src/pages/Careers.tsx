
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Heart, Users, Search, Mail } from 'lucide-react';

const Careers = () => {
  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-secondary/10 rounded-full">
              <Heart className="h-12 w-12 text-secondary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-primary mb-4">Join Our Mission</h1>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            Help us empower women and children by joining our team of dedicated professionals.
          </p>
        </div>

        {/* Current Status Card */}
        <Card className="mb-12 bg-white border-0 shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-accent/10 rounded-full">
                <Search className="h-8 w-8 text-accent" />
              </div>
            </div>
            <CardTitle className="text-2xl text-primary">Current Opportunities</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="py-12">
              <h3 className="text-lg font-semibold text-foreground mb-2">No roles available, for now</h3>
              <p className="text-foreground/70 mb-6">
                We're currently not hiring, but we're always looking for passionate individuals who want to make a difference.
              </p>
              <div className="bg-muted rounded-lg p-6">
                <p className="text-sm text-foreground/70">
                  Keep checking back or reach out to us directly if you're interested in contributing to our mission.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What We Look For */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-primary text-center mb-8">What We Look For</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-3">
                  <Heart className="h-8 w-8 text-secondary" />
                </div>
                <CardTitle className="text-lg text-primary">Compassion</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-foreground/70">
                  A genuine desire to help vulnerable women and children in need.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-3">
                  <Users className="h-8 w-8 text-secondary" />
                </div>
                <CardTitle className="text-lg text-primary">Collaboration</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-foreground/70">
                  Ability to work effectively with diverse teams and communities.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-3">
                  <Search className="h-8 w-8 text-secondary" />
                </div>
                <CardTitle className="text-lg text-primary">Innovation</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-foreground/70">
                  Creative problem-solving skills and passion for using technology for good.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Section */}
        <Card className="bg-gradient-to-r from-primary to-primary/90 text-white">
          <CardContent className="text-center py-12">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/20 rounded-full">
                <Mail className="h-10 w-10 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-4">Stay Connected</h3>
            <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
              Interested in future opportunities? Want to volunteer or partner with us?
            </p>
            <Button 
              size="lg" 
              className="bg-secondary hover:bg-secondary/90 text-white shadow-lg"
              asChild
            >
              <Link to="/contact">Get In Touch</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Careers;
