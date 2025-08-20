
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const DonationCancelled = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 p-4">
      <div className="max-w-2xl mx-auto pt-16">
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <XCircle className="h-8 w-8 text-orange-600" />
            </div>
            <CardTitle className="text-2xl text-orange-800">Donation Cancelled</CardTitle>
            <CardDescription className="text-lg">
              Your donation was not processed. No charges were made to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
              <Heart className="h-8 w-8 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold text-orange-800 mb-2">We Understand</h3>
              <p className="text-orange-700">
                Sometimes circumstances change. Your consideration alone means a lot to us 
                and the communities we serve.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Other ways to help:</h4>
              <ul className="text-left space-y-2 text-muted-foreground">
                <li className="flex items-start space-x-2">
                  <Heart className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Share our mission with friends and family</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Heart className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Follow us on social media to stay updated</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Heart className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Consider volunteering or partnering with us</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild>
                <Link to="/donate">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Try Again
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/">Return Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DonationCancelled;
