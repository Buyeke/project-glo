import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Eye, Users, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import JobPostingForm from '@/components/employer/JobPostingForm';
import PaymentScreen from '@/components/employer/PaymentScreen';
import EmployerAuth from '@/components/employer/EmployerAuth';
import ApplicantManagement from '@/components/employer/ApplicantManagement';

interface JobPosting {
  id: string;
  title: string;
  job_type: string;
  pay_amount: number;
  location: string;
  status: string;
  expires_at: string;
  applicant_count: number;
  created_at: string;
}

interface EmployerProfile {
  id: string;
  company_name: string;
  contact_person: string;
  phone_number: string;
  email: string;
  verified: boolean;
}

const EmployerDashboard: React.FC = () => {
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [employerProfile, setEmployerProfile] = useState<EmployerProfile | null>(null);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showJobForm, setShowJobForm] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [pendingJob, setPendingJob] = useState<any>(null);
  const [viewingApplicants, setViewingApplicants] = useState<{ jobId: string; jobTitle: string } | null>(null);

  useEffect(() => {
    if (user) {
      fetchEmployerProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Fetch job postings only after employer profile is loaded
  useEffect(() => {
    if (employerProfile?.id) {
      fetchJobPostings();
    }
  }, [employerProfile?.id]);

  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      toast.success('✅ Your job listing is now live! It will stay active for 30 days.');
      navigate('/employer-dashboard', { replace: true });
    } else if (paymentStatus === 'cancelled') {
      toast.error('Payment was cancelled. Your job listing was not published.');
      navigate('/employer-dashboard', { replace: true });
    }
  }, [searchParams, navigate]);

  const fetchEmployerProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('employer_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setEmployerProfile(data);
    } catch (error) {
      console.error('Error fetching employer profile:', error);
    }
  };

  const fetchJobPostings = async () => {
    if (!employerProfile?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .eq('employer_id', employerProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobPostings(data || []);
    } catch (error) {
      console.error('Error fetching job postings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJobSubmit = (jobData: any) => {
    setPendingJob(jobData);
    setShowJobForm(false);
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setPendingJob(null);
    fetchJobPostings();
    toast.success('✅ Your job listing is now live! It will stay active for 30 days.');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800',
      pending_payment: 'bg-yellow-100 text-yellow-800'
    };
    return variants[status] || variants.draft;
  };

  if (!user) {
    return <EmployerAuth />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (showJobForm) {
    return (
      <JobPostingForm
        employerProfile={employerProfile}
        onSubmit={handleJobSubmit}
        onCancel={() => setShowJobForm(false)}
      />
    );
  }

  if (showPayment) {
    return (
      <PaymentScreen
        jobData={pendingJob}
        employerProfile={employerProfile}
        onSuccess={handlePaymentSuccess}
        onCancel={() => {
          setShowPayment(false);
          setPendingJob(null);
        }}
      />
    );
  }

  if (viewingApplicants) {
    return (
      <ApplicantManagement
        jobId={viewingApplicants.jobId}
        jobTitle={viewingApplicants.jobTitle}
        onBack={() => setViewingApplicants(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 py-4 sm:py-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Employer Dashboard</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Welcome back, {employerProfile?.contact_person || 'Employer'}
                {!employerProfile?.company_name && (
                  <span className="block text-orange-600 text-sm mt-1">
                    Please complete your profile to post jobs effectively
                  </span>
                )}
              </p>
            </div>
            <Button onClick={() => setShowJobForm(true)} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Post New Job
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="dashboard" className="text-xs sm:text-sm py-2">Dashboard</TabsTrigger>
            <TabsTrigger value="jobs" className="text-xs sm:text-sm py-2">My Jobs</TabsTrigger>
            <TabsTrigger value="profile" className="text-xs sm:text-sm py-2">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4 sm:space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Jobs</CardTitle>
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                  <div className="text-xl sm:text-2xl font-bold">{jobPostings.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Active Jobs</CardTitle>
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                  <div className="text-xl sm:text-2xl font-bold">
                    {jobPostings.filter(job => job.status === 'active').length}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Applicants</CardTitle>
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                  <div className="text-xl sm:text-2xl font-bold">
                    {jobPostings.reduce((sum, job) => sum + job.applicant_count, 0)}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Total Spent</CardTitle>
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                  <div className="text-xl sm:text-2xl font-bold">KES 5,000</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Job Postings</CardTitle>
                <CardDescription>Your latest job listings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {jobPostings.slice(0, 5).map((job) => (
                    <div key={job.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm sm:text-base truncate">{job.title}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">{job.location}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Posted {new Date(job.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:space-y-2">
                        {job.status === 'pending_payment' ? (
                          <Button 
                            size="sm" 
                            className="text-xs"
                            onClick={() => {
                              setPendingJob({
                                id: job.id,
                                title: job.title,
                                job_type: job.job_type,
                                pay_amount: job.pay_amount,
                                location: job.location
                              });
                              setShowPayment(true);
                            }}
                          >
                            <DollarSign className="w-3 h-3 mr-1" />
                            Pay Now
                          </Button>
                        ) : (
                          <Badge className={getStatusBadge(job.status)}>
                            {job.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        )}
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {job.applicant_count} applicants
                        </p>
                      </div>
                    </div>
                  ))}
                  {jobPostings.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No job postings yet. Click "Post New Job" to get started!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">All Job Postings</CardTitle>
                <CardDescription>Manage your job listings</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="space-y-3 sm:space-y-4">
                  {jobPostings.map((job) => (
                    <div key={job.id} className="border rounded-lg p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4 mb-3 sm:mb-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base sm:text-xl font-semibold truncate">{job.title}</h3>
                          <p className="text-sm text-muted-foreground">{job.job_type} • {job.location}</p>
                          <p className="text-base sm:text-lg font-bold text-primary">KES {job.pay_amount.toLocaleString()}</p>
                        </div>
                        <Badge className={getStatusBadge(job.status)}>
                          {job.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                        <div className="text-xs sm:text-sm text-muted-foreground">
                          <p>{job.applicant_count} applicants</p>
                          <p>Expires: {new Date(job.expires_at).toLocaleDateString()}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          {job.status === 'active' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 sm:flex-none text-xs sm:text-sm"
                              onClick={() => setViewingApplicants({ jobId: job.id, jobTitle: job.title })}
                            >
                              <Users className="w-3 h-3 mr-1" />
                              View Applicants ({job.applicant_count})
                            </Button>
                          )}
                          {job.status === 'pending_payment' && (
                            <Button 
                              size="sm" 
                              className="flex-1 sm:flex-none text-xs sm:text-sm"
                              onClick={() => {
                                setPendingJob({
                                  id: job.id,
                                  title: job.title,
                                  job_type: job.job_type,
                                  pay_amount: job.pay_amount,
                                  location: job.location
                                });
                                setShowPayment(true);
                              }}
                            >
                              <DollarSign className="w-3 h-3 mr-1" />
                              Pay Now
                            </Button>
                          )}
                          {job.status === 'expired' && (
                            <Button size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm bg-green-600 hover:bg-green-700">
                              Renew (KES 2,000)
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Company Profile</CardTitle>
                <CardDescription>Manage your employer information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-muted-foreground">Company Name</label>
                    <p className="mt-1 text-sm sm:text-base text-foreground">{employerProfile?.company_name || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-muted-foreground">Contact Person</label>
                    <p className="mt-1 text-sm sm:text-base text-foreground">{employerProfile?.contact_person || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-muted-foreground">Phone Number</label>
                    <p className="mt-1 text-sm sm:text-base text-foreground">{employerProfile?.phone_number || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-muted-foreground">Email</label>
                    <p className="mt-1 text-sm sm:text-base text-foreground">{employerProfile?.email || 'Not set'}</p>
                  </div>
                </div>
                <div className="pt-4">
                  <Button variant="outline" className="w-full sm:w-auto">Edit Profile</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EmployerDashboard;
