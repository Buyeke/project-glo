
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Edit, Save, X, Plus } from 'lucide-react';

interface ContentItem {
  id: string;
  content_key: string;
  content_value: any;
  content_type: string;
  section: string;
  description?: string;
  published: boolean;
}

const ContentManagement = () => {
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, any>>({});
  const queryClient = useQueryClient();

  const { data: content, isLoading } = useQuery({
    queryKey: ['admin-site-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .order('section', { ascending: true })
        .order('content_key', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const updateContentMutation = useMutation({
    mutationFn: async ({ id, content_value }: { id: string; content_value: any }) => {
      const { error } = await supabase
        .from('site_content')
        .update({ content_value })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-site-content'] });
      queryClient.invalidateQueries({ queryKey: ['site-content'] });
      toast({
        title: 'Content updated',
        description: 'The content has been successfully updated.',
      });
      setEditingItem(null);
      setEditValues({});
    },
    onError: (error) => {
      toast({
        title: 'Error updating content',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleEdit = (item: ContentItem) => {
    setEditingItem(item.id);
    setEditValues({ [item.id]: item.content_value });
  };

  const handleSave = (item: ContentItem) => {
    const newValue = editValues[item.id];
    updateContentMutation.mutate({ id: item.id, content_value: newValue });
  };

  const handleCancel = () => {
    setEditingItem(null);
    setEditValues({});
  };

  const renderContentEditor = (item: ContentItem) => {
    const isEditing = editingItem === item.id;
    const currentValue = isEditing ? editValues[item.id] : item.content_value;

    if (item.content_type === 'stat') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Number</label>
              {isEditing ? (
                <Input
                  value={currentValue?.number || ''}
                  onChange={(e) => setEditValues({
                    ...editValues,
                    [item.id]: { ...currentValue, number: e.target.value }
                  })}
                />
              ) : (
                <div className="p-2 bg-muted rounded text-2xl font-bold">{currentValue?.number}</div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Label</label>
              {isEditing ? (
                <Input
                  value={currentValue?.label || ''}
                  onChange={(e) => setEditValues({
                    ...editValues,
                    [item.id]: { ...currentValue, label: e.target.value }
                  })}
                />
              ) : (
                <div className="p-2 bg-muted rounded">{currentValue?.label}</div>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (item.content_type === 'text') {
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium">Text Content</label>
          {isEditing ? (
            currentValue?.text && currentValue.text.length > 100 ? (
              <Textarea
                value={currentValue?.text || ''}
                onChange={(e) => setEditValues({
                  ...editValues,
                  [item.id]: { text: e.target.value }
                })}
                rows={4}
              />
            ) : (
              <Input
                value={currentValue?.text || ''}
                onChange={(e) => setEditValues({
                  ...editValues,
                  [item.id]: { text: e.target.value }
                })}
              />
            )
          ) : (
            <div className="p-3 bg-muted rounded">
              {currentValue?.text || 'No content'}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading content...</div>;
  }

  const groupedContent = content?.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, ContentItem[]>) || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Management</h2>
          <p className="text-muted-foreground">
            Edit website content and statistics
          </p>
        </div>
      </div>

      <Tabs defaultValue="homepage" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="homepage">Homepage</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="partnerships">Partners</TabsTrigger>
        </TabsList>

        {Object.entries(groupedContent).map(([section, items]) => (
          <TabsContent key={section} value={section} className="space-y-4">
            <div className="grid gap-4">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-medium">
                          {item.content_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {item.description}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {item.content_type}
                        </Badge>
                        <div className="flex gap-1">
                          {editingItem === item.id ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSave(item)}
                                disabled={updateContentMutation.isPending}
                              >
                                <Save className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancel}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {renderContentEditor(item)}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ContentManagement;
