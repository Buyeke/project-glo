
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Calendar, MapPin, Phone } from 'lucide-react';

interface ProfileHeaderProps {
  profile: {
    id: string;
    full_name: string;
    profile_photo_url?: string;
    location?: string;
    phone?: string;
    support_stage?: string;
    visit_count?: number;
    age?: number;
  };
}

const ProfileHeader = ({ profile }: ProfileHeaderProps) => {
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-start space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={profile.profile_photo_url} alt={profile.full_name} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {getInitials(profile.full_name || 'User')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground mb-2">{profile.full_name}</h2>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
              {profile.age && (
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{profile.age} years old</span>
                </div>
              )}
              
              {profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location}</span>
                </div>
              )}
              
              {profile.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  <span>{profile.phone}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <Badge className={getStageBadgeColor(profile.support_stage)}>
                {profile.support_stage?.replace('_', ' ').toUpperCase() || 'INITIAL'}
              </Badge>
              
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Visits: {profile.visit_count || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
