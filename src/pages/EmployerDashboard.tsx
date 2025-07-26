
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
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
  const [employerProfile, setEmployerProfile] = useState<EmployerProfile | null>(null);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showJobForm, setShowJobForm] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [pendingJob, setPendingJob] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchEmployerProfile();
      fetchJobPostings();
    } else {
      setLoading(false);
    }
  }, [user]);

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
    try {
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .eq('employer_id', employerProfile?.id || '')
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Employer Dashboard</h1>
              <p className="text-gray-600">
                Welcome back, {employerProfile?.contact_person || 'Employer'}
              </p>
            </div>
            <Button onClick={() => setShowJobForm(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Post New Job
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="jobs">My Jobs</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{jobPostings.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {jobPostings.filter(job => job.status === 'active').length}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {jobPostings.reduce((sum, job) => sum + job.applicant_count, 0)}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">KES 5,000</div>
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
                <div className="space-y-4">
                  {jobPostings.slice(0, 5).map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{job.title}</h4>
                        <p className="text-sm text-gray-600">{job.location}</p>
                        <p className="text-sm text-gray-500">
                          Posted {new Date(job.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge className={getStatusBadge(job.status)}>
                          {job.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <p className="text-sm text-gray-600">
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

          <TabsContent value="jobs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Job Postings</CardTitle>
                <CardDescription>Manage your job listings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jobPostings.map((job) => (
                    <div key={job.id} className="border rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold">{job.title}</h3>
                          <p className="text-gray-600">{job.job_type} • {job.location}</p>
                          <p className="text-lg font-bold text-blue-600">KES {job.pay_amount}</p>
                        </div>
                        <Badge className={getStatusBadge(job.status)}>
                          {job.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          <p>{job.applicant_count} applicants</p>
                          <p>Expires: {new Date(job.expires_at).toLocaleDateString()}</p>
                        </div>
                        
                        <div className="space-x-2">
                          {job.status === 'active' && (
                            <Button variant="outline" size="sm">
                              View Applicants
                            </Button>
                          )}
                          {job.status === 'expired' && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
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

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Profile</CardTitle>
                <CardDescription>Manage your employer information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company Name</label>
                    <p className="mt-1 text-sm text-gray-900">{employerProfile?.company_name || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                    <p className="mt-1 text-sm text-gray-900">{employerProfile?.contact_person || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <p className="mt-1 text-sm text-gray-900">{employerProfile?.phone_number || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{employerProfile?.email || 'Not set'}</p>
                  </div>
                </div>
                <div className="pt-4">
                  <Button variant="outline">Edit Profile</Button>
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
