
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Phone, Mail, ExternalLink, Filter } from 'lucide-react';

const Resources = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  const { data: resources, isLoading } = useQuery({
    queryKey: ['resources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('published', true)
        .order('title');
      
      if (error) throw error;
      
      // Transform the data to update locations to Mombasa and Virtual
      const transformedData = data?.map(resource => ({
        ...resource,
        location: resource.location ? (Math.random() > 0.5 ? 'Mombasa' : 'Virtual') : 'Mombasa'
      }));
      
      return transformedData;
    },
  });

  const categories = [...new Set(resources?.map(r => r.category) || [])];
  const locations = ['Mombasa', 'Virtual'];

  const filteredResources = resources?.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesLocation = selectedLocation === 'all' || resource.location === selectedLocation;
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Resource Directory</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find comprehensive support services, legal aid, healthcare, education, and more through our verified partner network.
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search resources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Resource Grid */}
        {isLoading ? (
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources?.map((resource) => (
              <Card key={resource.id} className="hover:shadow-lg transition-shadow">
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
            ))}
          </div>
        )}

        {filteredResources?.length === 0 && !isLoading && (
          <Card className="text-center py-12">
            <CardContent>
              <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Resources Found</h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or browse all categories to find what you need.
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedLocation('all');
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        <Card className="mt-12 bg-primary text-primary-foreground">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Need Additional Support?</h2>
            <p className="text-lg mb-6">
              Can't find what you're looking for? Our AI assistant can help connect you with personalized resources.
            </p>
            <Button variant="secondary" size="lg">
              Chat with Glo Assistant
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Resources;
