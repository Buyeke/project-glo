
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Package, Calendar, User } from 'lucide-react';

interface AllocatedResource {
  id: string;
  allocated_at: string;
  status: string;
  notes?: string;
  resources: {
    id: string;
    title: string;
    category: string;
    description?: string;
  };
}

interface AllocatedResourcesProps {
  userId: string;
}

const AllocatedResources = ({ userId }: AllocatedResourcesProps) => {
  const { data: allocatedResources, isLoading } = useQuery({
    queryKey: ['allocated-resources', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('allocated_resources')
        .select(`
          id,
          allocated_at,
          status,
          notes,
          resources:resource_id (
            id,
            title,
            category,
            description
          )
        `)
        .eq('user_id', userId)
        .order('allocated_at', { ascending: false });
      
      if (error) throw error;
      return data as AllocatedResource[];
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'allocated': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    const iconClass = "w-4 h-4";
    switch (category.toLowerCase()) {
      case 'shelter':
      case 'housing':
        return <Package className={iconClass} />;
      default:
        return <Package className={iconClass} />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Allocated Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading resources...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Allocated Resources</CardTitle>
        <CardDescription>
          Resources and services allocated to your profile
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!allocatedResources || allocatedResources.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No resources allocated yet</p>
            <p className="text-sm mt-2">Resources will appear here once allocated by your caseworker</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allocatedResources.map((allocation) => (
              <div key={allocation.id} className="p-4 border rounded-lg bg-card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(allocation.resources.category)}
                    <h4 className="font-medium">{allocation.resources.title}</h4>
                  </div>
                  <Badge className={getStatusColor(allocation.status)}>
                    {allocation.status.toUpperCase()}
                  </Badge>
                </div>
                
                {allocation.resources.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {allocation.resources.description}
                  </p>
                )}
                
                {allocation.notes && (
                  <div className="p-3 bg-muted rounded-md mb-3">
                    <p className="text-sm">
                      <strong>Notes:</strong> {allocation.notes}
                    </p>
                  </div>
                )}
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Allocated: {formatDate(allocation.allocated_at)}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {allocation.resources.category}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AllocatedResources;
