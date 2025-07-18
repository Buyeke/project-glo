
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Calendar, Phone, Globe } from 'lucide-react';
import ServiceCalendar from '@/components/calendar/ServiceCalendar';

interface Service {
  id: string;
  title: string;
  description: string;
  location: string;
  delivery_mode: string;
  contact_phone?: string;
  contact_url?: string;
  key_features?: string[];
}

interface ServiceBookingModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (bookingDate: Date) => void;
}

const ServiceBookingModal: React.FC<ServiceBookingModalProps> = ({
  service,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [showCalendar, setShowCalendar] = useState(false);

  if (!service) return null;

  const keyFeatures = service.key_features || [];

  const handleBookingSuccess = () => {
    setShowCalendar(false);
    if (onSuccess) {
      // Create a default booking date since ServiceCalendar doesn't provide one
      onSuccess(new Date());
    }
    // Optional: close modal after booking
    // onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{service.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Service Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Service Description</h3>
              <p className="text-muted-foreground mb-4">{service.description}</p>
              
              {keyFeatures.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Key Features</h4>
                  <ul className="space-y-1">
                    {keyFeatures.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span>{service.location}</span>
                <Badge variant="outline">{service.delivery_mode}</Badge>
              </div>

              {service.contact_phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-green-600" />
                  <span>{service.contact_phone}</span>
                </div>
              )}

              {service.contact_url && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-purple-600" />
                  <a 
                    href={service.contact_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:underline"
                  >
                    More Information
                  </a>
                </div>
              )}

              <div className="pt-4">
                <Button 
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="w-full"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {showCalendar ? 'Hide Calendar' : 'Book This Service'}
                </Button>
              </div>
            </div>
          </div>

          {/* Calendar Section */}
          {showCalendar && (
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Select Date & Time</h3>
              <ServiceCalendar 
                onBookingCreate={handleBookingSuccess}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceBookingModal;
