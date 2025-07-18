
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, dateFns } from 'react-day-picker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CalendarDays, Clock, User } from 'lucide-react';
import 'react-day-picker/dist/style.css';

interface Appointment {
  id: string;
  appointment_date: string;
  service_type: string;
  status: string;
  duration_minutes: number;
  notes?: string;
  caseworker: {
    full_name: string;
  };
}

const ServiceCalendar = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          service_type,
          status,
          duration_minutes,
          notes,
          caseworker:caseworker_id (
            full_name
          )
        `)
        .eq('user_id', user.id)
        .order('appointment_date', { ascending: true });

      if (error) throw error;
      return data as Appointment[];
    },
    enabled: !!user,
  });

  const updateAppointment = useMutation({
    mutationFn: async ({ appointmentId, status }: { appointmentId: string; status: string }) => {
      const { error } = await supabase
        .from('appointments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', appointmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: "Appointment updated",
        description: "The appointment status has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update appointment.",
        variant: "destructive",
      });
    },
  });

  const getAppointmentDates = () => {
    if (!appointments) return [];
    return appointments.map(apt => new Date(apt.appointment_date));
  };

  const getAppointmentsForDate = (date: Date) => {
    if (!appointments) return [];
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date);
      return aptDate.toDateString() === date.toDateString();
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Appointment Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading calendar...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            Appointment Calendar
          </CardTitle>
          <CardDescription>
            View and manage your scheduled appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                modifiers={{
                  appointment: getAppointmentDates(),
                }}
                modifiersStyles={{
                  appointment: { 
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    border: '2px solid rgb(59, 130, 246)',
                    borderRadius: '4px'
                  },
                }}
                className="rounded-md border"
              />
            </div>

            <div>
              {selectedDate ? (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Appointments for {selectedDate.toLocaleDateString()}
                  </h3>
                  {getAppointmentsForDate(selectedDate).length === 0 ? (
                    <p className="text-muted-foreground">No appointments scheduled for this date.</p>
                  ) : (
                    <div className="space-y-3">
                      {getAppointmentsForDate(selectedDate).map((appointment) => (
                        <div key={appointment.id} className="p-4 border rounded-lg bg-card">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium">{appointment.service_type}</h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <Clock className="w-4 h-4" />
                                <span>{formatTime(appointment.appointment_date)}</span>
                                <span>({appointment.duration_minutes} min)</span>
                              </div>
                            </div>
                            <Badge className={getStatusColor(appointment.status)}>
                              {appointment.status}
                            </Badge>
                          </div>
                          
                          {appointment.caseworker && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                              <User className="w-4 h-4" />
                              <span>with {appointment.caseworker.full_name}</span>
                            </div>
                          )}

                          {appointment.notes && (
                            <p className="text-sm text-muted-foreground mb-3">
                              {appointment.notes}
                            </p>
                          )}

                          {appointment.status === 'scheduled' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateAppointment.mutate({
                                    appointmentId: appointment.id,
                                    status: 'completed',
                                  })
                                }
                                disabled={updateAppointment.isPending}
                              >
                                Mark Complete
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateAppointment.mutate({
                                    appointmentId: appointment.id,
                                    status: 'cancelled',
                                  })
                                }
                                disabled={updateAppointment.isPending}
                              >
                                Cancel
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a date to view appointments</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {!appointments || appointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No appointments scheduled</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments
                .filter(apt => apt.status === 'scheduled' && new Date(apt.appointment_date) >= new Date())
                .slice(0, 3)
                .map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{appointment.service_type}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(appointment.appointment_date).toLocaleDateString()} at{' '}
                        {formatTime(appointment.appointment_date)}
                      </p>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceCalendar;
