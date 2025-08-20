
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Home, Heart } from 'lucide-react';
import DonationForm from '@/components/donation/DonationForm';

const Donate = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Donate Hope</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your contribution directly impacts the lives of homeless women and children, 
            providing essential support and pathways to independence.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Donation Form */}
          <div>
            <DonationForm />
          </div>

          {/* Stats and Additional Info */}
          <div className="space-y-8">
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">50+</div>
                    <div className="text-sm opacity-90">Women Supported</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">100+</div>
                    <div className="text-sm opacity-90">Children Helped</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">10+</div>
                    <div className="text-sm opacity-90">Partner Shelters</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-6 text-center">Every Donation Matters</h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <GraduationCap className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-2">Education & Skills</h3>
                      <p className="text-sm text-gray-600">
                        Fund workshops on financial literacy, digital skills, and life skills training that empower women for long-term independence.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Home className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-2">Safe Housing</h3>
                      <p className="text-sm text-gray-600">
                        Support emergency shelter placement and transitional housing programs through our verified partner network.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Heart className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-2">Holistic Care</h3>
                      <p className="text-sm text-gray-600">
                        Enable comprehensive support including mental health services, healthcare access, and community integration programs.
                      </p>
                    </div>
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
