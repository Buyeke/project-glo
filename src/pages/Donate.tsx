import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Home, Heart, Sparkles } from 'lucide-react';
import DonationForm from '@/components/donation/DonationForm';
import DonationImpactStory from '@/components/donation/DonationImpactStory';

const Donate = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Make a Difference</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Donate Now – Every Contribution Matters
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Your donation directly impacts the lives of vulnerable women and children, 
            providing essential support and pathways to independence.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Donation Form */}
          <div>
            <DonationForm 
              title="Choose Your Donation Amount"
              description="100% of your donation goes directly to supporting vulnerable communities"
            />
          </div>

          {/* Stats, Story, and Additional Info */}
          <div className="space-y-8">
            {/* Impact Story & Trust Signals */}
            <DonationImpactStory />

            {/* How Donations Are Used */}
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6 text-center text-foreground">How Your Donation Helps</h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2 text-foreground">Education & Skills</h3>
                      <p className="text-sm text-muted-foreground">
                        Fund workshops on financial literacy, digital skills, and life skills training that empower women for long-term independence.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Home className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2 text-foreground">Safe Housing</h3>
                      <p className="text-sm text-muted-foreground">
                        Support emergency shelter placement and transitional housing programs through our verified partner network.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Heart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2 text-foreground">Holistic Care</h3>
                      <p className="text-sm text-muted-foreground">
                        Enable comprehensive support including mental health services, healthcare access, and community integration programs.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Impact Stats */}
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">200+</div>
                    <div className="text-sm opacity-90">Women Supported</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">300+</div>
                    <div className="text-sm opacity-90">Children Helped</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">15+</div>
                    <div className="text-sm opacity-90">Partner Shelters</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donate;
