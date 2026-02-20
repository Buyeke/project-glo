
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, Users, Home, Utensils } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSiteContent } from '@/hooks/useSiteContent';

interface DonationFormProps {
  showImpactItems?: boolean;
  title?: string;
  description?: string;
}

const tierIcons = [Heart, Users, Home, Utensils];

const defaultTiers = [
  { title: 'Dignity Kits', description: 'Essential hygiene and personal care items', amount: '$25', ksh: 'KSh 3,250', numericAmount: 25, numericKsh: 3250 },
  { title: 'Mental Health Support', description: 'One week of counseling and therapy sessions', amount: '$60', ksh: 'KSh 7,800', numericAmount: 60, numericKsh: 7800 },
  { title: 'Temporary Housing', description: 'Safe shelter for a woman for one week', amount: '$100', ksh: 'KSh 13,000', numericAmount: 100, numericKsh: 13000 },
  { title: 'Family Nutrition', description: 'Nutritious meals for a family of 4 for a month', amount: '$250', ksh: 'KSh 32,500', numericAmount: 250, numericKsh: 32500 },
];

const DonationForm = ({ 
  showImpactItems = true, 
  title = "Make a Donation",
  description = "Choose your donation amount and help us continue our mission"
}: DonationFormProps) => {
  const { toast } = useToast();
  const { data: siteData } = useSiteContent();
  const contentMap = siteData?.contentMap || {};

  const tiers = [1, 2, 3, 4].map((i, idx) => {
    const tier = contentMap[`donation_tier_${i}`] || defaultTiers[idx];
    return {
      icon: tierIcons[idx],
      title: tier.title,
      description: tier.description,
      amount: tier.amount,
      ksh: tier.ksh,
      numericAmount: tier.numericAmount || defaultTiers[idx].numericAmount,
      numericKsh: tier.numericKsh || defaultTiers[idx].numericKsh,
    };
  });

  const predefinedAmounts = tiers.map(t => ({
    amount: t.numericAmount,
    description: t.description,
    ksh: t.numericKsh,
  }));

  const [selectedAmount, setSelectedAmount] = useState(predefinedAmounts[1]?.amount || 60);
  const [customAmount, setCustomAmount] = useState('');
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    message: '',
    anonymous: false,
  });
  const [isProcessing, setIsProcessing] = useState(false);

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
      const { data, error } = await supabase.functions.invoke('process-donation-payment', {
        body: {
          amount: donationAmount,
          currency: 'USD',
          description: `Donation to Project GLO - $${donationAmount} USD`,
          return_url: `${window.location.origin}/donation-success`,
          cancel_url: `${window.location.origin}/donation-cancelled`,
          donor_email: donorInfo.email,
          donor_name: donorInfo.anonymous ? null : donorInfo.name,
          message: donorInfo.message,
          anonymous: donorInfo.anonymous,
        },
      });

      if (error) throw error;

      if (data?.approval_url) {
        window.open(data.approval_url, '_blank');
        
        toast({
          title: "Redirecting to Paystack",
          description: "You'll be redirected to complete your donation securely.",
        });

        setTimeout(() => {
          setSelectedAmount(predefinedAmounts[1]?.amount || 60);
          setCustomAmount('');
          setDonorInfo({ name: '', email: '', message: '', anonymous: false });
        }, 2000);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "There was an issue processing your donation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {showImpactItems && (
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
              {tiers.map((item, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-muted/30 rounded-lg border">
                  <div className="flex-shrink-0">
                    <item.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                    <div className="text-lg font-bold text-primary">{item.amount} / {item.ksh}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-medium mb-4 block">Select Amount (USD)</Label>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {predefinedAmounts.map((option) => (
                <Card 
                  key={option.amount}
                  className={`cursor-pointer transition-colors ${
                    selectedAmount === option.amount ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleAmountSelect(option.amount)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary mb-1">
                      ${option.amount}
                    </div>
                    <div className="text-sm text-muted-foreground mb-1">
                      KSh {option.ksh.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {option.description}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="relative">
              <Label htmlFor="customAmount" className="text-sm">Custom Amount (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
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
              {customAmount && (
                <p className="text-sm text-muted-foreground mt-1">
                  ≈ KSh {(parseFloat(customAmount) * 130).toLocaleString()}
                </p>
              )}
            </div>
          </div>

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

          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-foreground">Secure Payment via Paystack</span>
              <div className="text-2xl font-bold text-primary">Paystack</div>
            </div>
            <p className="text-sm text-muted-foreground">
              Your payment is secured with industry-standard encryption. 
              Pay with M-Pesa, card, or bank transfer.
            </p>
          </div>

          <Button 
            onClick={handleDonate}
            disabled={isProcessing}
            className="w-full py-3 text-lg"
            size="lg"
          >
            {isProcessing ? (
              'Processing...'
            ) : (
              `Donate $${customAmount || selectedAmount} USD Now`
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            All donations are processed securely through Paystack.
            Your contribution will help us provide essential services.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DonationForm;
