
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { MatchLog, ServiceProvider } from '@/types/matching';
import { formatDistanceToNow } from 'date-fns';
import { Phone, Mail, MapPin, Star, Clock, CheckCircle } from 'lucide-react';

const MatchResults = () => {
  const { user } = useAuth();

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['user-matches', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('match_logs')
        .select(`
          *,
          service_providers (*)
        `)
        .eq('user_id', user.id)
        .order('matched_at', { ascending: false });
      
      if (error) throw error;
      
      // Cast the Supabase types to our expected interfaces
      return data.map(match => ({
        ...match,
        match_criteria: match.match_criteria as MatchLog['match_criteria'],
        user_feedback: match.user_feedback as MatchLog['user_feedback'],
        service_providers: {
          ...match.service_providers,
          location_data: match.service_providers.location_data as ServiceProvider['location_data'],
          contact_info: match.service_providers.contact_info as ServiceProvider['contact_info'],
          capacity_info: match.service_providers.capacity_info as ServiceProvider['capacity_info'],
          operating_hours: match.service_providers.operating_hours as ServiceProvider['operating_hours']
        } as ServiceProvider
      })) as (MatchLog & { service_providers: ServiceProvider })[];
    },
    enabled: !!user,
  });

  if (isLoading) {
    return <div className="p-4">Loading your matches...</div>;
  }

  if (matches.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">No Matches Yet</h3>
            <p className="text-gray-600">
              Complete your needs assessment to get matched with service providers.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Your Service Matches</h1>
        <Badge variant="outline">{matches.length} matches found</Badge>
      </div>

      <div className="space-y-4">
        {matches.map((match) => {
          const provider = match.service_providers;
          
          return (
            <Card key={match.id} className="border-l-4 border-l-green-500">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{provider.provider_name}</CardTitle>
                    <CardDescription>
                      Matched {formatDistanceToNow(new Date(match.matched_at), { addSuffix: true })}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-semibold">{Math.round(match.match_score)}% Match</span>
                    </div>
                    <Badge 
                      variant={match.match_type === 'emergency' ? 'destructive' : 'default'}
                    >
                      {match.match_type.toUpperCase()}
                    </Badge>
                    <Badge 
                      variant={
                        match.status === 'completed' ? 'default' :
                        match.status === 'accepted' ? 'secondary' :
                        match.status === 'declined' ? 'destructive' : 'outline'
                      }
                    >
                      {match.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Services Offered */}
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Services Offered:</h4>
                  <div className="flex flex-wrap gap-1">
                    {provider.service_types.map(service => (
                      <Badge key={service} variant="outline" className="text-xs">
                        {service.replace('_', ' ').toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-600" />
                  <span>{provider.location_data.address}</span>
                  {match.match_criteria?.location_match?.distance_km && (
                    <Badge variant="outline" className="text-xs">
                      {match.match_criteria.location_match.distance_km} km away
                    </Badge>
                  )}
                </div>

                {/* Languages */}
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-1">Languages Supported:</h4>
                  <div className="flex flex-wrap gap-1">
                    {provider.languages_supported.map(lang => (
                      <Badge key={lang} variant="secondary" className="text-xs">
                        {lang.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Contact Information:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-600" />
                      <span>{provider.contact_info.phone}</span>
                      <Button size="sm" variant="outline" className="ml-auto">
                        Call Now
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-600" />
                      <span>{provider.contact_info.email}</span>
                      <Button size="sm" variant="outline" className="ml-auto">
                        Send Email
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Match Details */}
                {match.match_criteria && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Why This Match:</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {match.match_criteria.service_match && (
                        <div>
                          <span className="font-medium">Service Match:</span> {Math.round(match.match_criteria.service_match.score)}%
                        </div>
                      )}
                      {match.match_criteria.language_match && (
                        <div>
                          <span className="font-medium">Language:</span> {match.match_criteria.language_match.supported ? 'Supported' : 'Not supported'}
                        </div>
                      )}
                      {match.match_criteria.location_match && (
                        <div>
                          <span className="font-medium">Location:</span> {match.match_criteria.location_match.distance_km} km
                        </div>
                      )}
                      {match.match_criteria.vulnerability_match && (
                        <div>
                          <span className="font-medium">Specialization:</span> {Math.round(match.match_criteria.vulnerability_match.score)}%
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Status Updates */}
                {match.provider_response && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Provider Response:</span>
                    </div>
                    <p className="text-sm text-blue-700">{match.provider_response}</p>
                    {match.responded_at && (
                      <p className="text-xs text-blue-600 mt-1">
                        Responded {formatDistanceToNow(new Date(match.responded_at), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MatchResults;
