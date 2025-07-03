
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Home, Briefcase, Users, MapPin, Clock, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ServiceRequestForm from '@/components/services/ServiceRequestForm';
import ServiceBookingModal from '@/components/services/ServiceBookingModal';
import { usePageTracking } from '@/hooks/useDataTracking';

interface Service {
  id: string;
  title: string;
  description: string;
  key_features: string[];
  availability: string;
  priority_level: string;
  language_support: string;
  category: string;
  location: string;
  delivery_mode: string;
  contact_phone?: string;
  contact_url?: string;
}

const Services = () => {
  usePageTracking();
  
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const categoryIcons = {
    Emergency: Home,
    Healthcare: Heart,
    Employment: Briefcase,
    Legal: Users,
    'Basic Needs': Heart,
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm, selectedCategory, selectedLocation]);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('availability', 'Available')
        .order('priority_level', { ascending: false });

      if (error) throw error;
      
      if (data) {
        // Transform the data to match our Service interface
        const transformedServices = data.map(service => ({
          ...service,
          key_features: Array.isArray(service.key_features) ? service.key_features : [],
          location: service.location || 'Nairobi',
          delivery_mode: service.delivery_mode || 'In-Person'
        })) as Service[];
        
        setServices(transformedServices);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = services;

    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }

    if (selectedLocation !== 'all') {
      filtered = filtered.filter(service => service.location === selectedLocation);
    }

    setFilteredServices(filtered);
  };

  const categories = [...new Set(services.map(service => service.category))];
  const locations = [...new Set(services.map(service => service.location))];

  const handleBookService = (service: Service) => {
    setSelectedService(service);
    setShowBookingModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Available Services</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the support services available to help you on your journey. Book sessions or request assistance directly.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4 lg:space-y-0 lg:flex lg:space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-full lg:w-48">
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

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredServices.map((service) => {
            const IconComponent = categoryIcons[service.category as keyof typeof categoryIcons] || Heart;
            
            return (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <IconComponent className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{service.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{service.category}</Badge>
                          {service.priority_level === 'Urgent' && (
                            <Badge variant="destructive">Urgent</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {service.description}
                  </CardDescription>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {service.location} ({service.delivery_mode})
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      {service.language_support}
                    </div>
                  </div>

                  {service.key_features && service.key_features.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Key Features:</h4>
                      <ul className="text-xs space-y-1">
                        {service.key_features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleBookService(service)}
                      className="flex-1"
                      size="sm"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Session
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowRequestForm(true)}
                    >
                      Request Help
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No services found matching your criteria.</p>
          </div>
        )}

        {/* Request Support Button */}
        <div className="text-center">
          <Button 
            onClick={() => setShowRequestForm(true)}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Need Custom Support? Contact Us
          </Button>
        </div>

        {/* Service Request Form Modal */}
        {showRequestForm && (
          <ServiceRequestForm 
            onClose={() => setShowRequestForm(false)}
          />
        )}

        {/* Service Booking Modal */}
        {selectedService && (
          <ServiceBookingModal
            service={selectedService}
            isOpen={showBookingModal}
            onClose={() => setShowBookingModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Services;
