import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface PaymentScreenProps {
  jobData: any;
  employerProfile: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentScreen: React.FC<PaymentScreenProps> = ({ jobData, employerProfile, onSuccess, onCancel }) => {
  const { session } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handlePayment = async () => {
    if (!session) {
      toast.error('Please log in to complete payment');
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('process-paystack-job-payment', {
        body: {
          job_data: jobData,
          employer_profile_id: employerProfile.id,
          amount_kes: 5000,
          return_url: `${window.location.origin}/employer-dashboard?payment=success`,
          cancel_url: `${window.location.origin}/employer-dashboard?payment=cancelled`,
        },
      });

      if (error) throw error;

      if (data?.payment_url) {
        window.location.href = data.payment_url;
      } else {
        throw new Error('Failed to create payment');
      }
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      toast.error(error.message || 'Failed to initiate payment');
      setIsProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center space-y-6">
            <div className="flex justify-center">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-green-600">Payment Successful!</h2>
              <p className="text-muted-foreground mt-2">
                ✅ Your job listing is now live! It will stay active for 30 days. 
                You'll be notified before expiry to renew for 2,000 KES.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <div className="bg-background shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Button variant="ghost" onClick={onCancel} className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Job Form
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Complete Payment</h1>
              <p className="text-muted-foreground">Pay securely with Paystack to publish your job</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Job Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Job Summary</CardTitle>
              <CardDescription>Review your job posting details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{jobData.title}</h3>
                <Badge variant="outline" className="mt-1">{jobData.job_type}</Badge>
              </div>
              
              <div className="space-y-2">
                <p><span className="font-medium">Pay:</span> KES {jobData.pay_amount}</p>
                <p><span className="font-medium">Location:</span> {jobData.location}</p>
                {jobData.job_date && (
                  <p><span className="font-medium">Date:</span> {jobData.job_date}</p>
                )}
                {jobData.job_time && (
                  <p><span className="font-medium">Time:</span> {jobData.job_time}</p>
                )}
              </div>

              <div>
                <p className="font-medium">Description:</p>
                <p className="text-sm text-muted-foreground mt-1">{jobData.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Secure payment via Paystack</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 rounded-lg p-4 border-primary bg-primary/5">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-6 h-6 text-primary" />
                    <div className="flex-1">
                      <h4 className="font-semibold">Paystack</h4>
                      <p className="text-sm text-muted-foreground">Pay with M-Pesa, card, or bank transfer</p>
                    </div>
                    <div className="w-4 h-4 rounded-full bg-primary border-2 border-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-foreground">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Job listing (30 days)</span>
                    <span className="font-semibold">KES 5,000</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-bold text-foreground">
                      <span>Total</span>
                      <span>KES 5,000</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Button */}
            <Button 
              onClick={handlePayment}
              className="w-full text-lg py-6"
              disabled={isProcessing || !session}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                  Processing Payment...
                </>
              ) : !session ? (
                <>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Please Log In First
                </>
              ) : (
                'Pay KES 5,000 with Paystack'
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Your job will go live immediately after payment confirmation. 
              You'll receive a confirmation email with your job listing details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentScreen;
