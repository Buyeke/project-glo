
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import ResourceCard from './ResourceCard';

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

interface ResourcesGridProps {
  resources: Resource[] | undefined;
  isLoading: boolean;
  onClearFilters: () => void;
}

const ResourcesGrid = ({ resources, isLoading, onClearFilters }: ResourcesGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-16 bg-gray-200 rounded mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (resources?.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Resources Found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or browse all categories to find what you need.
          </p>
          <Button 
            variant="default" 
            onClick={onClearFilters}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Clear Filters
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {resources?.map((resource) => (
        <ResourceCard key={resource.id} resource={resource} />
      ))}
    </div>
  );
};

export default ResourcesGrid;
