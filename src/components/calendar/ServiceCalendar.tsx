
import React, { useState, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Calendar as CalendarIcon, Users } from 'lucide-react';
import { useBookings } from '@/hooks/useBookings';
import { format, addDays, isSameDay, getDay } from 'date-fns';

interface Service {
  id: string;
  title: string;
  location: string;
  delivery_mode: string;
}

interface ServiceCalendarProps {
  services: Service[];
  selectedService?: Service;
  onBookingCreate?: () => void;
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const ServiceCalendar: React.FC<ServiceCalendarProps> = ({ 
  services, 
  selectedService,
  onBookingCreate 
}) => {
  const { schedules, bookings, createBooking, loading } = useBookings();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const availableSlots = useMemo(() => {
    if (!selectedDate || !selectedService) return [];

    const dayOfWeek = dayNames[getDay(selectedDate)];
    const serviceSchedules = schedules.filter(
      schedule => schedule.service_id === selectedService.id && 
                 schedule.available_day === dayOfWeek
    );

    return serviceSchedules.map(schedule => {
      const slotDateTime = new Date(selectedDate);
      const [hours, minutes] = schedule.available_time.split(':');
      slotDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const isBooked = bookings.some(booking => 
        booking.service_id === selectedService.id &&
        booking.status === 'confirmed' &&
        isSameDay(new Date(booking.booking_date), slotDateTime) &&
        new Date(booking.booking_date).getTime() === slotDateTime.getTime()
      );

      return {
        ...schedule,
        dateTime: slotDateTime,
        isBooked,
        isPast: slotDateTime < new Date()
      };
    });
  }, [selectedDate, selectedService, schedules, bookings]);

  const upcomingBookings = useMemo(() => {
    return bookings
      .filter(booking => 
        new Date(booking.booking_date) >= new Date() && 
        booking.status === 'confirmed'
      )
      .sort((a, b) => new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime())
      .slice(0, 5);
  }, [bookings]);

  const handleBookSlot = async (slot: any) => {
    if (!selectedService || slot.isBooked || slot.isPast) return;

    const success = await createBooking(
      selectedService.id,
      selectedService.title,
      slot.dateTime
    );

    if (success && onBookingCreate) {
      onBookingCreate();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendar Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Select Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => date < new Date()}
            className="rounded-md border"
          />
          
          {selectedService && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900">{selectedService.title}</h4>
              <div className="flex items-center gap-2 mt-2 text-sm text-blue-700">
                <MapPin className="h-4 w-4" />
                {selectedService.location} ({selectedService.delivery_mode})
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Slots */}
      <Card>
        <CardHeader>
          <CardTitle>
            Available Time Slots
            {selectedDate && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedService ? (
            <p className="text-muted-foreground">Please select a service to view available slots</p>
          ) : availableSlots.length === 0 ? (
            <p className="text-muted-foreground">No available slots for this date</p>
          ) : (
            <div className="space-y-3">
              {availableSlots.map((slot, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border transition-colors ${
                    slot.isBooked 
                      ? 'bg-gray-100 border-gray-200' 
                      : slot.isPast
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-white border-blue-200 hover:bg-blue-50 cursor-pointer'
                  }`}
                  onClick={() => !slot.isBooked && !slot.isPast && handleBookSlot(slot)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">
                        {format(slot.dateTime, 'h:mm a')}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({slot.duration_minutes} min)
                      </span>
                    </div>
                    <div>
                      {slot.isBooked ? (
                        <Badge variant="secondary">Booked</Badge>
                      ) : slot.isPast ? (
                        <Badge variant="outline">Past</Badge>
                      ) : (
                        <Button 
                          size="sm" 
                          disabled={loading}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookSlot(slot);
                          }}
                        >
                          Book Now
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Bookings */}
      {upcomingBookings.length > 0 && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Upcoming Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="p-4 border rounded-lg bg-green-50 border-green-200">
                  <h4 className="font-semibold text-green-900">{booking.service_title}</h4>
                  <p className="text-sm text-green-700 mt-1">
                    {format(new Date(booking.booking_date), 'EEEE, MMM d')}
                  </p>
                  <p className="text-sm text-green-700">
                    {format(new Date(booking.booking_date), 'h:mm a')}
                  </p>
                  <Badge variant="outline" className="mt-2 text-green-700 border-green-300">
                    {booking.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ServiceCalendar;
