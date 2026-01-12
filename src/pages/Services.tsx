
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Home, Briefcase, Users, MapPin, Clock, Calendar, Lock, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ServiceRequestForm from '@/components/services/ServiceRequestForm';
import ServiceBookingModal from '@/components/services/ServiceBookingModal';
import { usePageTracking } from '@/hooks/useDataTracking';
import HowItWorksSteps from '@/components/home/HowItWorksSteps';
import TrustBadge from '@/components/ui/TrustBadge';

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
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

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
          key_features: Array.isArray(service.key_features) ? service.key_features : []
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

  const handleBookingSuccess = (bookingDate: Date) => {
    const formattedDate = bookingDate.toLocaleDateString('en-US', {
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
    setBookingSuccess(`Your session has been booked for ${formattedDate}. We'll send you a personalized meeting link within 24 hours.`);
    setTimeout(() => setBookingSuccess(null), 5000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Booking Success Message */}
        {bookingSuccess && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-200 font-medium">{bookingSuccess}</p>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm mb-4">
            <Shield className="h-4 w-4" />
            No login required to browse
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Available Services</h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
            Discover the support services available to help you on your journey. Book sessions or request assistance directly.
          </p>
          
          {/* Compact How It Works */}
          <HowItWorksSteps variant="compact" />
        </div>

        {/* Trust and Location Info */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 max-w-3xl mx-auto mb-6">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-primary" />
            <p className="text-foreground font-medium">
              Serving communities with both in-person and virtual consultations
            </p>
          </div>
          <p className="text-muted-foreground text-sm">
            Once your request is confirmed, we'll send you a personalized virtual meeting link via email or WhatsApp within 24 hours.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-0 sm:flex sm:space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 text-base"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48 h-12">
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
            <SelectTrigger className="w-full sm:w-48 h-12">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {filteredServices.map((service) => {
            const IconComponent = categoryIcons[service.category as keyof typeof categoryIcons] || Heart;
            
            return (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IconComponent className="h-6 w-6 text-primary" />
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
                <CardContent className="space-y-4">
                  <CardDescription className="text-sm">
                    {service.description}
                  </CardDescription>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{service.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{service.language_support}</span>
                    </div>
                  </div>

                  {service.key_features && service.key_features.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Key Features:</h4>
                      <ul className="text-xs space-y-1">
                        {service.key_features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      onClick={() => handleBookService(service)}
                      className="flex-1 h-10"
                      size="sm"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Session
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-10"
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

        {/* Privacy Note - More prominent */}
        <TrustBadge variant="card" className="mb-8 max-w-2xl mx-auto" />

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No services found matching your criteria.</p>
          </div>
        )}

        {/* Request Support Button */}
        <div className="text-center">
          <Button 
            onClick={() => setShowRequestForm(true)}
            size="lg"
            className="h-12 px-8"
          >
            Need Custom Support? Contact Us
          </Button>
        </div>

        {/* Service Request Form Modal */}
        {showRequestForm && <ServiceRequestForm />}

        {/* Service Booking Modal */}
        {selectedService && (
          <ServiceBookingModal
            service={selectedService}
            isOpen={showBookingModal}
            onClose={() => setShowBookingModal(false)}
            onSuccess={handleBookingSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default Services;
