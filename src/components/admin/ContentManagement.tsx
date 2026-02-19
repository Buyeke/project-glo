
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
import { Edit, Save, X, Plus, Trash2 } from 'lucide-react';

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
    setEditValues({ [item.id]: JSON.parse(JSON.stringify(item.content_value)) });
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

    if (item.content_type === 'pricing_card') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Title / Name</label>
              {isEditing ? (
                <Input
                  value={currentValue?.title || currentValue?.name || ''}
                  onChange={(e) => setEditValues({
                    ...editValues,
                    [item.id]: { ...currentValue, title: e.target.value, name: e.target.value }
                  })}
                />
              ) : (
                <div className="p-2 bg-muted rounded font-semibold">{currentValue?.title || currentValue?.name}</div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Price</label>
              {isEditing ? (
                <Input
                  value={currentValue?.price || ''}
                  onChange={(e) => setEditValues({
                    ...editValues,
                    [item.id]: { ...currentValue, price: e.target.value }
                  })}
                  placeholder="e.g. $2,000/month"
                />
              ) : (
                <div className="p-2 bg-muted rounded text-lg font-bold">{currentValue?.price}</div>
              )}
            </div>
          </div>
          {(currentValue?.amount !== undefined) && (
            <div>
              <label className="text-sm font-medium">Numeric Amount (USD)</label>
              {isEditing ? (
                <Input
                  type="number"
                  value={currentValue?.amount || ''}
                  onChange={(e) => setEditValues({
                    ...editValues,
                    [item.id]: { ...currentValue, amount: Number(e.target.value) }
                  })}
                />
              ) : (
                <div className="p-2 bg-muted rounded">${currentValue?.amount}</div>
              )}
            </div>
          )}
          {currentValue?.description !== undefined && (
            <div>
              <label className="text-sm font-medium">Description</label>
              {isEditing ? (
                <Textarea
                  value={currentValue?.description || ''}
                  onChange={(e) => setEditValues({
                    ...editValues,
                    [item.id]: { ...currentValue, description: e.target.value }
                  })}
                  rows={3}
                />
              ) : (
                <div className="p-2 bg-muted rounded text-sm">{currentValue?.description}</div>
              )}
            </div>
          )}
          {currentValue?.features && (
            <div>
              <label className="text-sm font-medium">Features</label>
              {isEditing ? (
                <div className="space-y-2">
                  {(currentValue.features || []).map((feat: string, i: number) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Input
                        value={feat}
                        onChange={(e) => {
                          const newFeatures = [...currentValue.features];
                          newFeatures[i] = e.target.value;
                          setEditValues({
                            ...editValues,
                            [item.id]: { ...currentValue, features: newFeatures }
                          });
                        }}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const newFeatures = currentValue.features.filter((_: any, idx: number) => idx !== i);
                          setEditValues({
                            ...editValues,
                            [item.id]: { ...currentValue, features: newFeatures }
                          });
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newFeatures = [...(currentValue.features || []), ''];
                      setEditValues({
                        ...editValues,
                        [item.id]: { ...currentValue, features: newFeatures }
                      });
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Feature
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  {currentValue.features.map((f: string, i: number) => (
                    <div key={i} className="p-2 bg-muted rounded text-sm">• {f}</div>
                  ))}
                </div>
              )}
            </div>
          )}
          {currentValue?.links && (
            <div>
              <label className="text-sm font-medium">Links</label>
              {isEditing ? (
                <div className="space-y-2">
                  {(currentValue.links || []).map((link: any, i: number) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Input
                        placeholder="Label"
                        value={link.label || ''}
                        onChange={(e) => {
                          const newLinks = [...currentValue.links];
                          newLinks[i] = { ...newLinks[i], label: e.target.value };
                          setEditValues({
                            ...editValues,
                            [item.id]: { ...currentValue, links: newLinks }
                          });
                        }}
                      />
                      <Input
                        placeholder="URL"
                        value={link.href || ''}
                        onChange={(e) => {
                          const newLinks = [...currentValue.links];
                          newLinks[i] = { ...newLinks[i], href: e.target.value };
                          setEditValues({
                            ...editValues,
                            [item.id]: { ...currentValue, links: newLinks }
                          });
                        }}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const newLinks = currentValue.links.filter((_: any, idx: number) => idx !== i);
                          setEditValues({
                            ...editValues,
                            [item.id]: { ...currentValue, links: newLinks }
                          });
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newLinks = [...(currentValue.links || []), { label: '', href: '' }];
                      setEditValues({
                        ...editValues,
                        [item.id]: { ...currentValue, links: newLinks }
                      });
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Link
                  </Button>
                </div>
              ) : (
                <div className="p-2 bg-muted rounded text-sm">
                  {currentValue.links.map((l: any) => l.label).join(', ') || 'No links'}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    if (item.content_type === 'donation_tier') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              {isEditing ? (
                <Input
                  value={currentValue?.title || ''}
                  onChange={(e) => setEditValues({
                    ...editValues,
                    [item.id]: { ...currentValue, title: e.target.value }
                  })}
                />
              ) : (
                <div className="p-2 bg-muted rounded font-semibold">{currentValue?.title}</div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">USD Amount</label>
              {isEditing ? (
                <Input
                  value={currentValue?.amount || ''}
                  onChange={(e) => setEditValues({
                    ...editValues,
                    [item.id]: { ...currentValue, amount: e.target.value }
                  })}
                  placeholder="$25"
                />
              ) : (
                <div className="p-2 bg-muted rounded text-lg font-bold">{currentValue?.amount}</div>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            {isEditing ? (
              <Input
                value={currentValue?.description || ''}
                onChange={(e) => setEditValues({
                  ...editValues,
                  [item.id]: { ...currentValue, description: e.target.value }
                })}
              />
            ) : (
              <div className="p-2 bg-muted rounded text-sm">{currentValue?.description}</div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">KSh Amount</label>
              {isEditing ? (
                <Input
                  value={currentValue?.ksh || ''}
                  onChange={(e) => setEditValues({
                    ...editValues,
                    [item.id]: { ...currentValue, ksh: e.target.value }
                  })}
                  placeholder="KSh 3,250"
                />
              ) : (
                <div className="p-2 bg-muted rounded">{currentValue?.ksh}</div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Numeric Amount (for form)</label>
              {isEditing ? (
                <Input
                  type="number"
                  value={currentValue?.numericAmount || ''}
                  onChange={(e) => setEditValues({
                    ...editValues,
                    [item.id]: { ...currentValue, numericAmount: Number(e.target.value), numericKsh: Number(e.target.value) * 130 }
                  })}
                />
              ) : (
                <div className="p-2 bg-muted rounded">{currentValue?.numericAmount}</div>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (item.content_type === 'list') {
      const items = currentValue?.items || [];
      const isStringList = items.length === 0 || typeof items[0] === 'string';

      if (isStringList) {
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">List Items</label>
            {isEditing ? (
              <div className="space-y-2">
                {items.map((val: string, i: number) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input
                      value={val}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[i] = e.target.value;
                        setEditValues({
                          ...editValues,
                          [item.id]: { ...currentValue, items: newItems }
                        });
                      }}
                    />
                    <Button size="sm" variant="ghost" onClick={() => {
                      setEditValues({
                        ...editValues,
                        [item.id]: { ...currentValue, items: items.filter((_: any, idx: number) => idx !== i) }
                      });
                    }}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={() => {
                  setEditValues({
                    ...editValues,
                    [item.id]: { ...currentValue, items: [...items, ''] }
                  });
                }}>
                  <Plus className="h-3 w-3 mr-1" /> Add Item
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                {items.map((val: string, i: number) => (
                  <div key={i} className="p-2 bg-muted rounded text-sm">• {val}</div>
                ))}
              </div>
            )}
          </div>
        );
      }

      // Check if emergency contacts list (has organization/phone/locations_served)
      const isEmergencyContacts = items.length > 0 && items[0].organization !== undefined;

      if (isEmergencyContacts) {
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">Emergency Contacts</label>
            {isEditing ? (
              <div className="space-y-3">
                {items.map((contact: any, i: number) => (
                  <div key={i} className="border rounded p-3 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Organization"
                        value={contact.organization || ''}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[i] = { ...newItems[i], organization: e.target.value };
                          setEditValues({ ...editValues, [item.id]: { ...currentValue, items: newItems } });
                        }}
                      />
                      <Input
                        placeholder="Phone Number"
                        value={contact.phone || ''}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[i] = { ...newItems[i], phone: e.target.value };
                          setEditValues({ ...editValues, [item.id]: { ...currentValue, items: newItems } });
                        }}
                      />
                      <Input
                        placeholder="Locations Served"
                        value={contact.locations_served || ''}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[i] = { ...newItems[i], locations_served: e.target.value };
                          setEditValues({ ...editValues, [item.id]: { ...currentValue, items: newItems } });
                        }}
                      />
                      <Button size="sm" variant="ghost" onClick={() => {
                        setEditValues({
                          ...editValues,
                          [item.id]: { ...currentValue, items: items.filter((_: any, idx: number) => idx !== i) }
                        });
                      }}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={() => {
                  setEditValues({
                    ...editValues,
                    [item.id]: { ...currentValue, items: [...items, { organization: '', phone: '', locations_served: '' }] }
                  });
                }}>
                  <Plus className="h-3 w-3 mr-1" /> Add Contact
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                {items.map((c: any, i: number) => (
                  <div key={i} className="p-2 bg-muted rounded text-sm">
                    <strong>{c.organization}</strong> — {c.phone} ({c.locations_served})
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      // Object list (partners)
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium">Partners</label>
          {isEditing ? (
            <div className="space-y-3">
              {items.map((partner: any, i: number) => (
                <div key={i} className="border rounded p-3 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Name"
                      value={partner.name || ''}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[i] = { ...newItems[i], name: e.target.value };
                        setEditValues({ ...editValues, [item.id]: { ...currentValue, items: newItems } });
                      }}
                    />
                    <Input
                      placeholder="Location"
                      value={partner.location || ''}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[i] = { ...newItems[i], location: e.target.value };
                        setEditValues({ ...editValues, [item.id]: { ...currentValue, items: newItems } });
                      }}
                    />
                    <Button size="sm" variant="ghost" onClick={() => {
                      setEditValues({
                        ...editValues,
                        [item.id]: { ...currentValue, items: items.filter((_: any, idx: number) => idx !== i) }
                      });
                    }}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Description"
                    value={partner.description || ''}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[i] = { ...newItems[i], description: e.target.value };
                      setEditValues({ ...editValues, [item.id]: { ...currentValue, items: newItems } });
                    }}
                  />
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={() => {
                setEditValues({
                  ...editValues,
                  [item.id]: { ...currentValue, items: [...items, { name: '', location: '', description: '' }] }
                });
              }}>
                <Plus className="h-3 w-3 mr-1" /> Add Partner
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {items.map((p: any, i: number) => (
                <div key={i} className="p-2 bg-muted rounded text-sm">
                  <strong>{p.name}</strong> — {p.location}: {p.description}
                </div>
              ))}
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
            Edit website content, statistics, and pricing
          </p>
        </div>
      </div>

      <Tabs defaultValue="homepage" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="homepage">Homepage</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="partnerships">Partners</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
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
