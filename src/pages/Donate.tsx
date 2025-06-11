
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, Users, Home, Utensils, GraduationCap } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Donate = () => {
  const { toast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState(60);
  const [customAmount, setCustomAmount] = useState('');
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    message: '',
    anonymous: false,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const predefinedAmounts = [
    { amount: 25, description: 'Provides a dignity kit for one woman' },
    { amount: 60, description: 'Funds mental health support for one week' },
    { amount: 100, description: 'Offers temporary housing for a mother and child' },
    { amount: 250, description: 'Feeds a family of 4 for a week' },
  ];

  const impactItems = [
    {
      icon: Heart,
      title: 'Dignity Kits',
      description: 'Essential hygiene and personal care items',
      amount: '$25',
    },
    {
      icon: Users,
      title: 'Mental Health Support',
      description: 'One week of counseling and therapy sessions',
      amount: '$60',
    },
    {
      icon: Home,
      title: 'Temporary Housing',
      description: 'Safe shelter for a mother and child for one night',
      amount: '$100',
    },
    {
      icon: Utensils,
      title: 'Family Nutrition',
      description: 'Nutritious meals for a family of 4 for a week',
      amount: '$250',
    },
  ];

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(0);
  };

  const handleDonate = async () => {
    const donationAmount = customAmount ? parseFloat(customAmount) : selectedAmount;
    
    if (!donationAmount || donationAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid donation amount.",
        variant: "destructive",
      });
      return;
    }

    if (!donorInfo.email) {
      toast({
        title: "Email Required",
        description: "Please provide your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate PayPal integration processing
      // In a real implementation, you would integrate with PayPal SDK
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Save donation to database (placeholder)
      // await supabase.from('donations').insert({
      //   donor_email: donorInfo.email,
      //   amount: donationAmount,
      //   donor_name: donorInfo.anonymous ? null : donorInfo.name,
      //   message: donorInfo.message,
      //   anonymous: donorInfo.anonymous,
      //   status: 'completed',
      // });

      toast({
        title: "Thank You!",
        description: "Your donation has been processed successfully. You'll receive a confirmation email shortly.",
      });

      // Reset form
      setSelectedAmount(60);
      setCustomAmount('');
      setDonorInfo({ name: '', email: '', message: '', anonymous: false });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an issue processing your donation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

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
          {/* Impact Showcase */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-6 w-6 text-primary" />
                  <span>Your Impact</span>
                </CardTitle>
                <CardDescription>
                  See how your donation makes a real difference
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {impactItems.map((item, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-white rounded-lg border">
                      <div className="flex-shrink-0">
                        <item.icon className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        <div className="text-lg font-bold text-primary">{item.amount}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
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
          </div>

          {/* Donation Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Make a Donation</CardTitle>
                <CardDescription>
                  Choose your donation amount and help us continue our mission
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Amount Selection */}
                <div>
                  <Label className="text-base font-medium mb-4 block">Select Amount</Label>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {predefinedAmounts.map((option) => (
                      <Card 
                        key={option.amount}
                        className={`cursor-pointer transition-colors ${
                          selectedAmount === option.amount ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleAmountSelect(option.amount)}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-primary mb-1">
                            ${option.amount}
                          </div>
                          <div className="text-xs text-gray-600">
                            {option.description}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="relative">
                    <Label htmlFor="customAmount" className="text-sm">Custom Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        id="customAmount"
                        type="number"
                        value={customAmount}
                        onChange={(e) => handleCustomAmountChange(e.target.value)}
                        placeholder="Enter amount"
                        className="pl-8"
                        min="1"
                      />
                    </div>
                  </div>
                </div>

                {/* Donor Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="donorName">Full Name (Optional)</Label>
                    <Input
                      id="donorName"
                      value={donorInfo.name}
                      onChange={(e) => setDonorInfo(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="donorEmail">Email Address *</Label>
                    <Input
                      id="donorEmail"
                      type="email"
                      value={donorInfo.email}
                      onChange={(e) => setDonorInfo(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="donorMessage">Message (Optional)</Label>
                    <Textarea
                      id="donorMessage"
                      value={donorInfo.message}
                      onChange={(e) => setDonorInfo(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Leave a message of support..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="anonymous"
                      checked={donorInfo.anonymous}
                      onCheckedChange={(checked) => setDonorInfo(prev => ({ ...prev, anonymous: checked as boolean }))}
                    />
                    <Label htmlFor="anonymous" className="text-sm">
                      Make this donation anonymous
                    </Label>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Secure Payment via PayPal</span>
                    <div className="text-2xl font-bold text-blue-600">PayPal</div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Your payment is secured with industry-standard encryption. 
                    You can pay with PayPal or any major credit card.
                  </p>
                </div>

                {/* Donate Button */}
                <Button 
                  onClick={handleDonate}
                  disabled={isProcessing}
                  className="w-full py-3 text-lg"
                  size="lg"
                >
                  {isProcessing ? (
                    'Processing...'
                  ) : (
                    `Donate $${customAmount || selectedAmount} Now`
                  )}
                </Button>

                <p className="text-xs text-gray-600 text-center">
                  We're working to expand local donation options soon. 
                  Currently, all donations are processed through PayPal's secure platform.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Information */}
        <Card className="mt-12">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Every Donation Matters</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div>
                <GraduationCap className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold mb-2">Education & Skills</h3>
                <p className="text-sm text-gray-600">
                  Fund workshops on financial literacy, digital skills, and life skills training that empower women for long-term independence.
                </p>
              </div>
              <div>
                <Home className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold mb-2">Safe Housing</h3>
                <p className="text-sm text-gray-600">
                  Support emergency shelter placement and transitional housing programs through our verified partner network.
                </p>
              </div>
              <div>
                <Heart className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold mb-2">Holistic Care</h3>
                <p className="text-sm text-gray-600">
                  Enable comprehensive support including mental health services, healthcare access, and community integration programs.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Donate;
