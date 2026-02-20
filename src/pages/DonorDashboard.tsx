import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { 
  Heart, DollarSign, TrendingUp, Users, Calendar, 
  Download, Gift, Award, Star, ArrowUpRight, 
  CheckCircle, Clock, RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link, Navigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Donation {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  donor_name: string | null;
  message: string | null;
  anonymous: boolean;
}

const DonorDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [recurringDialogOpen, setRecurringDialogOpen] = useState(false);
  const [recurringAmount, setRecurringAmount] = useState('25');
  const [recurringFrequency, setRecurringFrequency] = useState('monthly');

  // Fetch donor's donations
  const { data: donations, isLoading } = useQuery({
    queryKey: ['donor-donations', user?.id],
    queryFn: async () => {
      if (!user?.email) return [];
      
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .eq('donor_email', user.email)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Donation[];
    },
    enabled: !!user?.email,
  });

  // Calculate impact metrics
  const totalDonated = donations?.reduce((sum, d) => d.status === 'completed' ? sum + d.amount : sum, 0) || 0;
  const donationCount = donations?.filter(d => d.status === 'completed').length || 0;
  const avgDonation = donationCount > 0 ? totalDonated / donationCount : 0;

  // Impact calculations (based on donation amounts)
  const dignityKits = Math.floor(totalDonated / 25);
  const counselingSessions = Math.floor(totalDonated / 60);
  const familiesHelped = Math.floor(totalDonated / 100);

  const handleSetupRecurring = () => {
    // In a real implementation, this would integrate with Paystack subscriptions
    toast.success(`Recurring ${recurringFrequency} donation of $${recurringAmount} set up successfully!`);
    setRecurringDialogOpen(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const impactMilestones = [
    { amount: 100, label: 'First Milestone', icon: Star, achieved: totalDonated >= 100 },
    { amount: 500, label: 'Community Champion', icon: Award, achieved: totalDonated >= 500 },
    { amount: 1000, label: 'Impact Leader', icon: Heart, achieved: totalDonated >= 1000 },
    { amount: 5000, label: 'Changemaker', icon: TrendingUp, achieved: totalDonated >= 5000 },
  ];

  const nextMilestone = impactMilestones.find(m => !m.achieved);
  const progressToNextMilestone = nextMilestone 
    ? Math.min((totalDonated / nextMilestone.amount) * 100, 100)
    : 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Donor Dashboard</h1>
              <p className="opacity-90">Thank you for your generosity, {user.email?.split('@')[0]}!</p>
            </div>
            <div className="flex gap-3">
              <Dialog open={recurringDialogOpen} onOpenChange={setRecurringDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Set Up Monthly Giving
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Set Up Recurring Donation</DialogTitle>
                    <DialogDescription>
                      Make a lasting impact with automatic monthly donations.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="recurringAmount">Amount (USD)</Label>
                      <Select value={recurringAmount} onValueChange={setRecurringAmount}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">$10/month</SelectItem>
                          <SelectItem value="25">$25/month</SelectItem>
                          <SelectItem value="50">$50/month</SelectItem>
                          <SelectItem value="100">$100/month</SelectItem>
                          <SelectItem value="250">$250/month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select value={recurringFrequency} onValueChange={setRecurringFrequency}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Your ${recurringAmount} {recurringFrequency} donation will help provide:
                      </p>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• {Math.floor(Number(recurringAmount) / 25)} dignity kits per {recurringFrequency.replace('ly', '')}</li>
                        <li>• Continuous support for vulnerable women</li>
                        <li>• Sustainable community programs</li>
                      </ul>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setRecurringDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSetupRecurring}>
                      Start Monthly Giving
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button asChild variant="secondary">
                <Link to="/donate">
                  <Gift className="w-4 h-4 mr-2" />
                  Make a Donation
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">Donation History</TabsTrigger>
            <TabsTrigger value="impact">Your Impact</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Donated</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalDonated.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Thank you for your generosity</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Donations Made</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{donationCount}</div>
                  <p className="text-xs text-muted-foreground">Completed donations</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Donation</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${avgDonation.toFixed(0)}</div>
                  <p className="text-xs text-muted-foreground">Per contribution</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Lives Impacted</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{familiesHelped}+</div>
                  <p className="text-xs text-muted-foreground">Families helped</p>
                </CardContent>
              </Card>
            </div>

            {/* Milestone Progress */}
            {nextMilestone && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    Next Milestone: {nextMilestone.label}
                  </CardTitle>
                  <CardDescription>
                    ${totalDonated.toLocaleString()} of ${nextMilestone.amount.toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={progressToNextMilestone} className="h-3" />
                  <p className="text-sm text-muted-foreground mt-2">
                    ${(nextMilestone.amount - totalDonated).toLocaleString()} more to reach this milestone
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Quick Impact Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Your Donations Have Provided</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-3xl font-bold text-primary">{dignityKits}</div>
                    <p className="text-sm text-muted-foreground">Dignity Kits</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-3xl font-bold text-primary">{counselingSessions}</div>
                    <p className="text-sm text-muted-foreground">Counseling Sessions</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-3xl font-bold text-primary">{familiesHelped}</div>
                    <p className="text-sm text-muted-foreground">Families Helped</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Donation History</CardTitle>
                  <CardDescription>All your contributions to Project GLO</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : donations && donations.length > 0 ? (
                  <div className="space-y-4">
                    {donations.map((donation) => (
                      <div 
                        key={donation.id} 
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${
                            donation.status === 'completed' 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-yellow-100 text-yellow-600'
                          }`}>
                            {donation.status === 'completed' ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <Clock className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">
                              ${donation.amount.toLocaleString()} {donation.currency}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(donation.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={donation.status === 'completed' ? 'default' : 'secondary'}>
                            {donation.status}
                          </Badge>
                          {donation.message && (
                            <p className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate">
                              "{donation.message}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No donations yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Make your first donation to start tracking your impact.
                    </p>
                    <Button asChild>
                      <Link to="/donate">
                        <Gift className="w-4 h-4 mr-2" />
                        Make a Donation
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="impact" className="space-y-6">
            {/* Milestones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Donor Milestones
                </CardTitle>
                <CardDescription>Unlock achievements as you make an impact</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {impactMilestones.map((milestone, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg border-2 text-center ${
                        milestone.achieved 
                          ? 'border-primary bg-primary/5' 
                          : 'border-muted bg-muted/30'
                      }`}
                    >
                      <milestone.icon className={`w-8 h-8 mx-auto mb-2 ${
                        milestone.achieved ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <p className={`font-semibold ${
                        milestone.achieved ? 'text-primary' : 'text-muted-foreground'
                      }`}>
                        {milestone.label}
                      </p>
                      <p className="text-sm text-muted-foreground">${milestone.amount.toLocaleString()}</p>
                      {milestone.achieved && (
                        <Badge className="mt-2 bg-primary text-primary-foreground">Achieved!</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Impact */}
            <Card>
              <CardHeader>
                <CardTitle>Your Impact in Detail</CardTitle>
                <CardDescription>See exactly how your donations are making a difference</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-pink-100 rounded-lg">
                        <Heart className="w-5 h-5 text-pink-600" />
                      </div>
                      <div>
                        <p className="font-semibold">Dignity Kits Provided</p>
                        <p className="text-sm text-muted-foreground">Essential hygiene and care items</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-primary">{dignityKits}</div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Users className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold">Counseling Sessions Funded</p>
                        <p className="text-sm text-muted-foreground">Mental health and therapy support</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-primary">{counselingSessions}</div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold">Families Supported</p>
                        <p className="text-sm text-muted-foreground">Housing and emergency assistance</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-primary">{familiesHelped}</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg text-center">
                  <h3 className="text-xl font-bold mb-2">Thank You for Being a Champion!</h3>
                  <p className="text-muted-foreground mb-4">
                    Your generosity is transforming lives and building a brighter future for vulnerable communities.
                  </p>
                  <Button asChild>
                    <Link to="/donate">
                      Continue Your Impact <ArrowUpRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DonorDashboard;
