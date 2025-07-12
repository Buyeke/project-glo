
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, ExternalLink } from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  category: string;
  summary?: string;
  description?: string;
  location?: string;
  service_type?: string;
  contact_info?: string;
  file_url?: string;
}

interface ResourceCardProps {
  resource: Resource;
}

const ResourceCard = ({ resource }: ResourceCardProps) => {
  const getCategoryColor = (category: string) => {
    const colors = {
      'legal aid': 'bg-blue-100 text-blue-800',
      'mental health': 'bg-green-100 text-green-800',
      'employment': 'bg-purple-100 text-purple-800',
      'health & wellness': 'bg-pink-100 text-pink-800',
      'education': 'bg-orange-100 text-orange-800',
      'housing': 'bg-indigo-100 text-indigo-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{resource.title}</CardTitle>
            <Badge className={getCategoryColor(resource.category)}>
              {resource.category.charAt(0).toUpperCase() + resource.category.slice(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">
          {resource.summary}
        </CardDescription>
        
        {resource.description && (
          <p className="text-sm text-gray-700 mb-4">
            {resource.description}
          </p>
        )}

        <div className="space-y-2 mb-4">
          {resource.location && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              {resource.location}
            </div>
          )}
          
          {resource.service_type && (
            <Badge variant="outline" className="text-xs">
              {resource.service_type}
            </Badge>
          )}
        </div>

        {resource.contact_info && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-sm mb-2">Contact Information</h4>
            <div className="text-sm text-gray-600 space-y-1">
              {resource.contact_info.includes('@') ? (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <a href={`mailto:${resource.contact_info}`} className="text-primary hover:underline">
                    {resource.contact_info}
                  </a>
                </div>
              ) : resource.contact_info.match(/\d/) ? (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <a href={`tel:${resource.contact_info}`} className="text-primary hover:underline">
                    {resource.contact_info}
                  </a>
                </div>
              ) : (
                <p>{resource.contact_info}</p>
              )}
            </div>
          </div>
        )}

        {resource.file_url && (
          <div className="mt-4">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Resource
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResourceCard;
