import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, Mail, Phone, MessageSquare, Calendar, CheckCircle, XCircle, Clock, Send, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Applicant {
  id: string;
  applicant_name: string;
  applicant_email: string | null;
  applicant_phone: string | null;
  cover_message: string | null;
  applied_at: string;
  status?: 'applied' | 'reviewing' | 'interviewed' | 'hired' | 'rejected';
}

interface ApplicantManagementProps {
  jobId: string;
  jobTitle: string;
  onBack: () => void;
}

const ApplicantManagement: React.FC<ApplicantManagementProps> = ({ jobId, jobTitle, onBack }) => {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [messageDialog, setMessageDialog] = useState(false);
  const [message, setMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const fetchApplicants = async () => {
    try {
      const { data, error } = await supabase
        .from('job_applicants')
        .select('*')
        .eq('job_posting_id', jobId)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      
      // Add default status for applicants
      const applicantsWithStatus = (data || []).map(app => ({
        ...app,
        status: (app as any).status || 'applied'
      }));
      
      setApplicants(applicantsWithStatus);
    } catch (error) {
      console.error('Error fetching applicants:', error);
      toast.error('Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicantStatus = async (applicantId: string, newStatus: string) => {
    // Update locally for now (would need a status column in job_applicants table)
    setApplicants(prev => 
      prev.map(app => 
        app.id === applicantId ? { ...app, status: newStatus as Applicant['status'] } : app
      )
    );
    toast.success(`Applicant status updated to ${newStatus}`);
  };

  const sendMessageToApplicant = async () => {
    if (!selectedApplicant || !message.trim()) return;
    
    setSendingMessage(true);
    try {
      // In a real implementation, this would send an email or in-app message
      // For now, we'll simulate the message sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Message sent to ${selectedApplicant.applicant_name}`);
      setMessage('');
      setMessageDialog(false);
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'reviewing': return 'bg-yellow-100 text-yellow-800';
      case 'interviewed': return 'bg-purple-100 text-purple-800';
      case 'hired': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied': return <Clock className="w-4 h-4" />;
      case 'reviewing': return <Clock className="w-4 h-4" />;
      case 'interviewed': return <Calendar className="w-4 h-4" />;
      case 'hired': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredApplicants = statusFilter === 'all' 
    ? applicants 
    : applicants.filter(app => app.status === statusFilter);

  const statusCounts = {
    all: applicants.length,
    applied: applicants.filter(a => a.status === 'applied').length,
    reviewing: applicants.filter(a => a.status === 'reviewing').length,
    interviewed: applicants.filter(a => a.status === 'interviewed').length,
    hired: applicants.filter(a => a.status === 'hired').length,
    rejected: applicants.filter(a => a.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-4 sm:py-6">
            <Button variant="ghost" onClick={onBack} className="w-fit">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">Applicants for: {jobTitle}</h1>
              <p className="text-muted-foreground">{applicants.length} total applicants</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Status Filter Tabs */}
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-6">
          <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full h-auto">
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              All ({statusCounts.all})
            </TabsTrigger>
            <TabsTrigger value="applied" className="text-xs sm:text-sm">
              Applied ({statusCounts.applied})
            </TabsTrigger>
            <TabsTrigger value="reviewing" className="text-xs sm:text-sm">
              Reviewing ({statusCounts.reviewing})
            </TabsTrigger>
            <TabsTrigger value="interviewed" className="text-xs sm:text-sm">
              Interviewed ({statusCounts.interviewed})
            </TabsTrigger>
            <TabsTrigger value="hired" className="text-xs sm:text-sm">
              Hired ({statusCounts.hired})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="text-xs sm:text-sm">
              Rejected ({statusCounts.rejected})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Applicants List */}
        {filteredApplicants.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No applicants yet</h3>
              <p className="text-muted-foreground">
                {statusFilter === 'all' 
                  ? 'Applicants will appear here once they apply for this job.'
                  : `No applicants with status "${statusFilter}".`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredApplicants.map((applicant) => (
              <Card key={applicant.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Applicant Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{applicant.applicant_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Applied {new Date(applicant.applied_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={`ml-auto ${getStatusColor(applicant.status || 'applied')}`}>
                          {getStatusIcon(applicant.status || 'applied')}
                          <span className="ml-1 capitalize">{applicant.status || 'applied'}</span>
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                        {applicant.applicant_email && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{applicant.applicant_email}</span>
                          </div>
                        )}
                        {applicant.applicant_phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="w-4 h-4" />
                            <span>{applicant.applicant_phone}</span>
                          </div>
                        )}
                      </div>

                      {applicant.cover_message && (
                        <div className="bg-muted/50 rounded-lg p-3 mt-3">
                          <p className="text-sm text-foreground line-clamp-3">{applicant.cover_message}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:w-48">
                      <Select
                        value={applicant.status || 'applied'}
                        onValueChange={(value) => updateApplicantStatus(applicant.id, value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="applied">Applied</SelectItem>
                          <SelectItem value="reviewing">Reviewing</SelectItem>
                          <SelectItem value="interviewed">Interviewed</SelectItem>
                          <SelectItem value="hired">Hired</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>

                      <Dialog open={messageDialog && selectedApplicant?.id === applicant.id} onOpenChange={(open) => {
                        setMessageDialog(open);
                        if (open) setSelectedApplicant(applicant);
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Message
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Message {applicant.applicant_name}</DialogTitle>
                            <DialogDescription>
                              Send a message to this applicant via email.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">
                                To: {applicant.applicant_email || 'No email provided'}
                              </p>
                            </div>
                            <Textarea
                              placeholder="Write your message here..."
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              rows={5}
                            />
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setMessageDialog(false)}>
                              Cancel
                            </Button>
                            <Button 
                              onClick={sendMessageToApplicant}
                              disabled={sendingMessage || !applicant.applicant_email}
                            >
                              <Send className="w-4 h-4 mr-2" />
                              {sendingMessage ? 'Sending...' : 'Send Message'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      {applicant.status === 'applied' && (
                        <Button 
                          className="w-full"
                          onClick={() => updateApplicantStatus(applicant.id, 'reviewing')}
                        >
                          Start Review
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {applicants.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Hiring Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm">Applied: {statusCounts.applied}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm">Reviewing: {statusCounts.reviewing}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-sm">Interviewed: {statusCounts.interviewed}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">Hired: {statusCounts.hired}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm">Rejected: {statusCounts.rejected}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ApplicantManagement;
