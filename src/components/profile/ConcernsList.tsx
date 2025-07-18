
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import AddConcernDialog from './AddConcernDialog';

interface Concern {
  id: string;
  concern_type: string;
  description?: string;
  resolved: boolean;
  date_logged: string;
  assigned_caseworker?: string;
}

interface ConcernsListProps {
  userId: string;
  isOwner: boolean;
}

const ConcernsList = ({ userId, isOwner }: ConcernsListProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: concerns, isLoading } = useQuery({
    queryKey: ['concerns', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_concerns')
        .select('*')
        .eq('user_id', userId)
        .order('date_logged', { ascending: false });
      
      if (error) throw error;
      return data as Concern[];
    },
  });

  const toggleResolved = useMutation({
    mutationFn: async ({ concernId, resolved }: { concernId: string; resolved: boolean }) => {
      const { error } = await supabase
        .from('user_concerns')
        .update({ resolved, updated_at: new Date().toISOString() })
        .eq('id', concernId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['concerns', userId] });
      toast({
        title: "Concern updated",
        description: "The concern status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update concern status.",
        variant: "destructive",
      });
    },
  });

  const getConcernIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'urgent':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
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
          <CardTitle>Concerns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading concerns...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Concerns</CardTitle>
            <CardDescription>
              Track and manage identified concerns and support needs
            </CardDescription>
          </div>
          {isOwner && (
            <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Concern
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {!concerns || concerns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No concerns recorded yet</p>
              {isOwner && (
                <p className="text-sm mt-2">Click "Add Concern" to get started</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {concerns.map((concern) => (
                <div
                  key={concern.id}
                  className={`p-4 border rounded-lg ${
                    concern.resolved ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getConcernIcon(concern.resolved ? 'resolved' : concern.concern_type)}
                      <span className="font-medium capitalize">
                        {concern.concern_type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={concern.resolved ? 'default' : 'secondary'}>
                        {concern.resolved ? 'Resolved' : 'Active'}
                      </Badge>
                      {isOwner && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            toggleResolved.mutate({
                              concernId: concern.id,
                              resolved: !concern.resolved,
                            })
                          }
                          disabled={toggleResolved.isPending}
                        >
                          {concern.resolved ? 'Reopen' : 'Mark Resolved'}
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {concern.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {concern.description}
                    </p>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Logged on {formatDate(concern.date_logged)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddConcernDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        userId={userId}
      />
    </>
  );
};

export default ConcernsList;
