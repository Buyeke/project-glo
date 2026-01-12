import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Home, Users, Utensils, Sparkles, Play } from 'lucide-react';
import DonationForm from '@/components/donation/DonationForm';
import DonationImpactStory from '@/components/donation/DonationImpactStory';
import HowGLOWorksModal from '@/components/home/HowGLOWorksModal';
import { Button } from '@/components/ui/button';

const Donate = () => {
  const impactTiers = [
    {
      icon: Heart,
      title: 'Dignity Kits',
      description: 'Essential hygiene and personal care items',
      amount: '$25',
      ksh: 'KSh 3,250',
      color: 'bg-pink-500',
    },
    {
      icon: Users,
      title: 'Mental Health Support',
      description: 'One week of counseling and therapy sessions',
      amount: '$60',
      ksh: 'KSh 7,800',
      color: 'bg-purple-500',
    },
    {
      icon: Home,
      title: 'Temporary Housing',
      description: 'Safe shelter for a woman for one week',
      amount: '$100',
      ksh: 'KSh 13,000',
      color: 'bg-blue-500',
    },
    {
      icon: Utensils,
      title: 'Family Nutrition',
      description: 'Nutritious meals for a family of 4 for a month',
      amount: '$250',
      ksh: 'KSh 32,500',
      color: 'bg-green-500',
    },
  ];

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
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Your donation directly supports vulnerable women and their families, 
            providing pathways to stability, safety, and opportunity.
          </p>
          
          {/* See How GLO Works button */}
          <HowGLOWorksModal 
            trigger={
              <Button variant="outline" size="lg" className="gap-2">
                <Play className="h-4 w-4" />
                See How GLO Works
              </Button>
            }
          />
        </div>
      </section>

      {/* Impact Tiers - Prominent Display */}
      <section className="py-12 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Your Impact at Every Level
            </h2>
            <p className="text-muted-foreground">
              Choose how you want to make a difference
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {impactTiers.map((tier, index) => {
              const IconComponent = tier.icon;
              return (
                <Card 
                  key={index} 
                  className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  <CardContent className="p-6 text-center">
                    <div className="relative mb-4 mx-auto w-fit">
                      <div className={`absolute inset-0 ${tier.color} rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity`} />
                      <div className={`relative h-16 w-16 rounded-full ${tier.color} flex items-center justify-center mx-auto`}>
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      {tier.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">
                      {tier.description}
                    </p>
                    
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-primary">
                        {tier.amount}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {tier.ksh}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Donation Form */}
          <div>
            <DonationForm 
              showImpactItems={false}
              title="Choose Your Donation Amount"
              description="100% of your donation goes directly to supporting vulnerable communities"
            />
          </div>

          {/* Stats, Story, and Additional Info */}
          <div className="space-y-8">
            {/* Impact Story & Trust Signals */}
            <DonationImpactStory />

            {/* Impact Stats */}
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">200+</div>
                    <div className="text-sm opacity-90">Women Supported</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">15+</div>
                    <div className="text-sm opacity-90">Partner Organizations</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">24/7</div>
                    <div className="text-sm opacity-90">AI Guided Support</div>
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
