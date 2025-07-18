
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Calendar, FileText, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProfileManagement } from '@/hooks/useProfileManagement';
import EnhancedProfileView from '@/components/profile/EnhancedProfileView';
import ServiceCalendar from '@/components/calendar/ServiceCalendar';

interface SimpleDashboardProps {
  profile: {
    id: string;
    full_name: string;
    user_type: string;
    visit_count?: number;
    support_stage?: string;
  };
}

const SimpleDashboard = ({ profile }: SimpleDashboardProps) => {
  const { updateVisitCount } = useProfileManagement(profile.id);

  // Increment visit count when user visits dashboard
  useEffect(() => {
    updateVisitCount.mutate();
  }, []);

  const quickActions = [
    {
      title: 'Get Support',
      description: 'Connect with our AI assistant for immediate help',
      icon: MessageCircle,
      href: '/#chatbot',
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      title: 'Find Resources',
      description: 'Browse available services and resources',
      icon: FileText,
      href: '/resources',
      color: 'bg-green-50 text-green-600 border-green-200',
    },
    {
      title: 'Book Services',
      description: 'Schedule appointments with service providers',
      icon: Calendar,
      href: '/services',
      color: 'bg-purple-50 text-purple-600 border-purple-200',
    },
    {
      title: 'Track Progress',
      description: 'View your support journey and milestones',
      icon: TrendingUp,
      href: '#profile',
      color: 'bg-orange-50 text-orange-600 border-orange-200',
    },
  ];

  const getStageBadgeColor = (stage?: string) => {
    switch (stage) {
      case 'initial': return 'bg-blue-100 text-blue-800';
      case 'assessment': return 'bg-yellow-100 text-yellow-800';
      case 'active_support': return 'bg-green-100 text-green-800';
      case 'transitioning': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <Card className="mb-8 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Heart className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, {profile.full_name?.split(' ')[0] || 'Friend'}! 💜
                </h1>
                <p className="text-primary-foreground/90 text-lg">
                  Your journey matters, and we're here to support you every step of the way.
                </p>
                <div className="flex items-center gap-4 mt-4">
                  <Badge className={getStageBadgeColor(profile.support_stage)} variant="secondary">
                    {profile.support_stage?.replace('_', ' ').toUpperCase() || 'INITIAL STAGE'}
                  </Badge>
                  <span className="text-sm">Visits: {profile.visit_count || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Card key={index} className={`hover:shadow-lg transition-shadow cursor-pointer border-2 ${action.color}`}>
                <CardContent className="p-6">
                  <action.icon className="w-8 h-8 mb-3" />
                  <h3 className="font-semibold mb-2">{action.title}</h3>
                  <p className="text-sm opacity-80 mb-4">{action.description}</p>
                  <Button asChild size="sm" variant="outline" className="w-full">
                    <Link to={action.href}>Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Enhanced Profile Section */}
        <div id="profile" className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Your Profile & Progress</h2>
          <EnhancedProfileView />
        </div>

        {/* Calendar Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Appointments & Calendar</h2>
          <ServiceCalendar />
        </div>

        {/* Support Message */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-6 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-green-600" />
            <h3 className="text-xl font-semibold mb-2 text-foreground">You're Not Alone</h3>
            <p className="text-muted-foreground mb-4">
              Our community and support team are here for you 24/7. 
              Whether you need immediate assistance or someone to talk to, we're just a message away.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="outline">
                <Link to="/#chatbot">Start Conversation</Link>
              </Button>
              <Button asChild>
                <Link to="/resources">Explore Resources</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SimpleDashboard;
