
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Home, Briefcase, MessageSquare, Calendar, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import RequestTracker from './RequestTracker';
import ServiceCalendar from '@/components/calendar/ServiceCalendar';
import { useBookings } from '@/hooks/useBookings';
import { usePageTracking } from '@/hooks/useDataTracking';
import { format } from 'date-fns';

interface IndividualDashboardProps {
  profile: any;
}

const IndividualDashboard: React.FC<IndividualDashboardProps> = ({ profile }) => {
  usePageTracking();
  const { bookings } = useBookings();

  const upcomingBookings = bookings
    .filter(booking => 
      new Date(booking.booking_date) >= new Date() && 
      booking.status === 'confirmed'
    )
    .sort((a, b) => new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime())
    .slice(0, 3);

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

        {/* Upcoming Bookings */}
        {upcomingBookings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Your Upcoming Sessions
              </CardTitle>
              <CardDescription>
                You have {upcomingBookings.length} confirmed booking{upcomingBookings.length > 1 ? 's' : ''} coming up
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                    <h4 className="font-semibold text-blue-900">{booking.service_title}</h4>
                    <div className="text-sm text-blue-700 mt-2 space-y-1">
                      <p>{format(new Date(booking.booking_date), 'EEEE, MMM d')}</p>
                      <p>{format(new Date(booking.booking_date), 'h:mm a')}</p>
                    </div>
                    <Badge variant="outline" className="mt-2 text-blue-700 border-blue-300">
                      {booking.status}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link to="/services">
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book More Services
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

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
                  <h4 className="font-semibold text-sm text-blue-900">New Booking System</h4>
                  <p className="text-xs text-blue-700 mt-1">
                    You can now book sessions directly through our new calendar system.
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-sm text-green-900">Multi-Location Services</h4>
                  <p className="text-xs text-green-700 mt-1">
                    Services are now available in Nairobi and Mombasa, with remote options.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Service Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-sm">Emergency Services</h4>
                    <p className="text-xs text-muted-foreground">Monday & Thursday</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Available
                  </Badge>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-sm">Healthcare Services</h4>
                    <p className="text-xs text-muted-foreground">Wednesday & Saturday</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Available
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
