
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Home, Briefcase, MessageSquare, Calendar, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import RequestTracker from './RequestTracker';
import { usePageTracking } from '@/hooks/useDataTracking';

interface IndividualDashboardProps {
  profile: any;
}

const IndividualDashboard: React.FC<IndividualDashboardProps> = ({ profile }) => {
  usePageTracking();

  const quickActions = [
    {
      title: 'Request Emergency Shelter',
      description: 'Find immediate safe housing',
      icon: Home,
      href: '/services',
      color: 'bg-red-50 text-red-600',
      urgent: true,
    },
    {
      title: 'Get Mental Health Support',
      description: 'Access counseling and therapy',
      icon: Heart,
      href: '/services',
      color: 'bg-pink-50 text-pink-600',
    },
    {
      title: 'Find Job Opportunities',
      description: 'Explore employment options',
      icon: Briefcase,
      href: '/services',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Browse Resources',
      description: 'Access helpful information',
      icon: MessageSquare,
      href: '/resources',
      color: 'bg-green-50 text-green-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Welcome Header */}
        <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  Welcome back, {profile.full_name || 'Friend'}!
                </h1>
                <p className="text-purple-100">
                  We're here to support you every step of the way.
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-90">Member since</div>
                <div className="text-lg font-semibold">
                  {new Date(profile.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <Link to={action.href} className="block">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{action.title}</h3>
                        {action.urgent && (
                          <Badge variant="destructive" className="text-xs">
                            Urgent
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Service Requests Tracking */}
        <RequestTracker />

        {/* Additional Support */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Important Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-sm text-blue-900">New Mental Health Resources</h4>
                  <p className="text-xs text-blue-700 mt-1">
                    We've added new counseling services available in multiple languages.
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-sm text-green-900">Job Training Program</h4>
                  <p className="text-xs text-green-700 mt-1">
                    Free digital literacy and vocational training starting next week.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-sm">Community Support Group</h4>
                    <p className="text-xs text-muted-foreground">Weekly meetup for mutual support</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Tomorrow
                  </Badge>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-sm">Legal Aid Workshop</h4>
                    <p className="text-xs text-muted-foreground">Know your housing rights</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Friday
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Contact */}
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-red-900">Need Immediate Help?</h3>
                <p className="text-sm text-red-700">
                  If you're in crisis or need emergency assistance, reach out now.
                </p>
              </div>
              <Button variant="destructive">
                Emergency Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IndividualDashboard;
