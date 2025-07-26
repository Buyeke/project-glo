
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Smartphone, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PaymentScreenProps {
  jobData: any;
  employerProfile: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentScreen: React.FC<PaymentScreenProps> = ({ jobData, employerProfile, onSuccess, onCancel }) => {
  const [selectedMethod, setSelectedMethod] = useState<'mpesa' | 'paypal'>('paypal');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handlePayPalPayment = async () => {
    setIsProcessing(true);

    try {
      // Create the job posting first
      const { data: jobPosting, error: jobError } = await supabase
        .from('job_postings')
        .insert({
          ...jobData,
          status: 'pending_payment',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        })
        .select()
        .single();

      if (jobError) throw jobError;

      // Create payment record
      const { data: payment, error: paymentError } = await supabase
        .from('job_payments')
        .insert({
          job_posting_id: jobPosting.id,
          employer_id: employerProfile.id,
          amount: 5000,
          payment_method: 'paypal',
          status: 'pending'
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Call PayPal payment processing edge function
      const { data, error } = await supabase.functions.invoke('process-paypal-payment', {
        body: {
          amount: 5000,
          currency: 'KES',
          description: `Job Listing: ${jobData.title}`,
          payment_id: payment.id,
          job_posting_id: jobPosting.id,
          return_url: `${window.location.origin}/employer-dashboard?payment=success`,
          cancel_url: `${window.location.origin}/employer-dashboard?payment=cancelled`
        }
      });

      if (error) throw error;

      if (data?.approval_url) {
        // Redirect to PayPal for payment
        window.location.href = data.approval_url;
      } else {
        throw new Error('Failed to create PayPal payment');
      }

    } catch (error: any) {
      console.error('Payment initiation error:', error);
      toast.error(error.message || 'Failed to initiate payment');
      setIsProcessing(false);
    }
  };

  const handleMpesaPayment = async () => {
    setIsProcessing(true);
    
    try {
      // Create the job posting first
      const { data: jobPosting, error: jobError } = await supabase
        .from('job_postings')
        .insert({
          ...jobData,
          status: 'pending_payment',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        })
        .select()
        .single();

      if (jobError) throw jobError;

      // For now, show a message that M-Pesa is coming soon
      toast.error('M-Pesa integration is coming soon. Please use PayPal for now.');
      setIsProcessing(false);
      
    } catch (error: any) {
      console.error('M-Pesa payment error:', error);
      toast.error('M-Pesa is not available yet');
      setIsProcessing(false);
    }
  };

  const handlePayment = () => {
    if (selectedMethod === 'paypal') {
      handlePayPalPayment();
    } else {
      handleMpesaPayment();
    }
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center space-y-6">
            <div className="flex justify-center">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-green-600">Payment Successful!</h2>
              <p className="text-gray-600 mt-2">
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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Button variant="ghost" onClick={onCancel} className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Job Form
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
              <p className="text-gray-600">Choose your payment method to publish your job</p>
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
                <p className="text-sm text-gray-600 mt-1">{jobData.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Select how you'd like to pay</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* PayPal Option */}
                <div 
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedMethod === 'paypal' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedMethod('paypal')}
                >
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                    <div className="flex-1">
                      <h4 className="font-semibold">PayPal</h4>
                      <p className="text-sm text-gray-600">Pay securely with PayPal</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedMethod === 'paypal' ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                    }`} />
                  </div>
                </div>

                {/* M-Pesa Option - Coming Soon */}
                <div 
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all opacity-50 ${
                    selectedMethod === 'mpesa' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedMethod('mpesa')}
                >
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-6 h-6 text-green-600" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">M-Pesa</h4>
                        <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                      </div>
                      <p className="text-sm text-gray-600">Pay with your mobile money</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedMethod === 'mpesa' ? 'bg-green-500 border-green-500' : 'border-gray-300'
                    }`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-900">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Job listing (30 days)</span>
                    <span className="font-semibold">KES 5,000</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-bold text-blue-900">
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
              disabled={isProcessing || (selectedMethod === 'mpesa')}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing Payment...
                </>
              ) : selectedMethod === 'mpesa' ? (
                <>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  M-Pesa Coming Soon
                </>
              ) : (
                `Pay KES 5,000 with PayPal`
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
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
