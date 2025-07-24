
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  MessageSquare, 
  FileText, 
  Calendar, 
  Activity,
  Shield,
  Download,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import BlogManagement from './BlogManagement';
import ContactSubmissionsPanel from './ContactSubmissionsPanel';
import ChatInteractionsPanel from './ChatInteractionsPanel';
import SecurityPanel from './SecurityPanel';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const exportContactData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please log in to export data",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`https://fznhhkxwzqipwfwihwqr.supabase.co/functions/v1/contact-data-export`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Export successful",
          description: result.message || "Contact data exported successfully",
        });
      } else {
        const error = await response.json();
        toast({
          title: "Export failed",
          description: error.error || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error exporting contact data:', error);
      toast({
        title: "Error",
        description: "Failed to export contact data",
        variant: "destructive",
      });
    }
  };

  const statsCards = [
    {
      title: "Total Users",
      value: "2,345",
      change: "+12%",
      changeType: "positive" as const,
      icon: Users,
      description: "Active users this month"
    },
    {
      title: "Contact Submissions",
      value: "156",
      change: "+8%",
      changeType: "positive" as const,
      icon: MessageSquare,
      description: "New submissions this week"
    },
    {
      title: "Security Events",
      value: "23",
      change: "-5%",
      changeType: "negative" as const,
      icon: Shield,
      description: "Security incidents this week"
    },
    {
      title: "System Health",
      value: "99.9%",
      change: "0%",
      changeType: "neutral" as const,
      icon: Activity,
      description: "Uptime this month"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your application and monitor system health
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportContactData} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsCards.map((stat) => (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={stat.changeType === 'positive' ? 'default' : 
                                stat.changeType === 'negative' ? 'destructive' : 'secondary'}
                      >
                        {stat.changeType === 'positive' ? <TrendingUp className="h-3 w-3 mr-1" /> : 
                         stat.changeType === 'negative' ? <AlertTriangle className="h-3 w-3 mr-1" /> : null}
                        {stat.change}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {stat.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common administrative tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col"
                    onClick={() => setActiveTab('contacts')}
                  >
                    <MessageSquare className="h-6 w-6 mb-2" />
                    Manage Contacts
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col"
                    onClick={() => setActiveTab('blog')}
                  >
                    <FileText className="h-6 w-6 mb-2" />
                    Manage Blog
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col"
                    onClick={() => setActiveTab('security')}
                  >
                    <Shield className="h-6 w-6 mb-2" />
                    Security Center
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>
                  Current system health and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Database Connection</span>
                    <Badge variant="default">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Authentication Service</span>
                    <Badge variant="default">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Storage Service</span>
                    <Badge variant="default">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Security Monitoring</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts">
            <ContactSubmissionsPanel />
          </TabsContent>

          <TabsContent value="blog">
            <BlogManagement />
          </TabsContent>

          <TabsContent value="chat">
            <ChatInteractionsPanel />
          </TabsContent>

          <TabsContent value="security">
            <SecurityPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
