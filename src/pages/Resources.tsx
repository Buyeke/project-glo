
import React, { useState } from 'react';
import ResourcesHeader from '@/components/resources/ResourcesHeader';
import ResourcesFilters from '@/components/resources/ResourcesFilters';
import ResourcesGrid from '@/components/resources/ResourcesGrid';
import ResourcesCTA from '@/components/resources/ResourcesCTA';
import { useResources } from '@/hooks/useResources';

const Resources = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  const { data: resources, isLoading } = useResources();

  const categories = [...new Set(resources?.map(r => r.category) || [])];
  const locations = [...new Set(resources?.map(r => r.location).filter(Boolean) || [])];

  const filteredResources = resources?.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesLocation = selectedLocation === 'all' || resource.location === selectedLocation;
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedLocation('all');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <ResourcesHeader />
        
        <ResourcesFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          categories={categories}
          locations={locations}
        />

        <ResourcesGrid
          resources={filteredResources}
          isLoading={isLoading}
          onClearFilters={handleClearFilters}
        />

        <ResourcesCTA />
      </div>
    </div>
  );
};

export default Resources;
