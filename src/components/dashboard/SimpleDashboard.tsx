
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { LifeBuoy, Calendar, MessageSquare, Heart } from 'lucide-react';

interface SimpleDashboardProps {
  profile: any;
}

const SimpleDashboard: React.FC<SimpleDashboardProps> = ({ profile }) => {
  const quickActions = [
    {
      title: 'Request Support',
      description: 'Get help with shelter, food, healthcare, or legal aid',
      icon: LifeBuoy,
      href: '/services',
      color: 'bg-red-50 text-red-600 border-red-200',
      urgent: true,
    },
    {
      title: 'View My Bookings',
      description: 'See your scheduled appointments and sessions',
      icon: Calendar,
      href: '/dashboard',
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      title: 'Open Chat Assistant',
      description: 'Get instant help from our AI assistant',
      icon: MessageSquare,
      href: '#',
      color: 'bg-green-50 text-green-600 border-green-200',
      onClick: () => {
        // This will open the chatbot
        const chatButton = document.querySelector('[data-chat-trigger]') as HTMLButtonElement;
        if (chatButton) chatButton.click();
      }
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Welcome Header */}
        <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardContent className="p-6">
            <div className="text-center">
              <Heart className="h-12 w-12 mx-auto mb-4 opacity-90" />
              <h1 className="text-2xl font-bold mb-2">
                Welcome, {profile.full_name || 'Friend'}!
              </h1>
              <p className="text-purple-100">
                You're not alone. We're here to support you every step of the way.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Card key={index} className={`hover:shadow-lg transition-shadow cursor-pointer border-2 ${action.color}`}>
              <CardContent className="p-6">
                {action.onClick ? (
                  <button onClick={action.onClick} className="w-full text-left">
                    <div className="text-center space-y-4">
                      <div className="mx-auto w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                        <action.icon className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">{action.title}</h3>
                        <p className="text-sm opacity-90">{action.description}</p>
                      </div>
                    </div>
                  </button>
                ) : (
                  <Link to={action.href} className="block">
                    <div className="text-center space-y-4">
                      <div className="mx-auto w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                        <action.icon className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">{action.title}</h3>
                        <p className="text-sm opacity-90">{action.description}</p>
                      </div>
                    </div>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Privacy Note */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🔒</div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Your Privacy Matters</h3>
                <p className="text-sm text-blue-800">
                  Your information is confidential and only shared with the organizations providing your support.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SimpleDashboard;
