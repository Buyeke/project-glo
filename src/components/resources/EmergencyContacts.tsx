import React from 'react';
import { Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useContentValue } from '@/hooks/useSiteContent';

const defaultContacts = [
  { organization: "Kenya Police", phone: "999 / 112", locations_served: "Nationwide" },
  { organization: "Childline Kenya", phone: "116", locations_served: "Nationwide" },
  { organization: "Healthcare Assistance Kenya (GBV)", phone: "1195", locations_served: "Nationwide" },
  { organization: "Gender Violence Recovery Centre (GVRC)", phone: "0709 319 000", locations_served: "Nairobi" },
  { organization: "FIDA Kenya (Legal Aid)", phone: "0722 509 760", locations_served: "Nationwide" },
];

interface EmergencyContact {
  organization: string;
  phone: string;
  locations_served: string;
}

const EmergencyContacts = () => {
  const contactsData = useContentValue('emergency_contacts', { items: defaultContacts });
  const contacts: EmergencyContact[] = contactsData?.items || defaultContacts;

  return (
    <Card className="border-destructive/30 bg-destructive/5 mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-destructive text-lg">
          <Phone className="h-5 w-5" />
          Emergency Contacts
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          If you or someone you know is in immediate danger, contact these services now.
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-destructive/20">
                <th className="text-left py-2 pr-4 font-semibold text-foreground">Organization</th>
                <th className="text-left py-2 pr-4 font-semibold text-foreground">Phone Number</th>
                <th className="text-left py-2 font-semibold text-foreground">Locations Served</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact, index) => {
                const primaryNumber = contact.phone.split('/')[0].trim().replace(/\s/g, '');
                return (
                  <tr key={index} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 pr-4 font-medium text-foreground">{contact.organization}</td>
                    <td className="py-2.5 pr-4">
                      <a
                        href={`tel:${primaryNumber}`}
                        className="text-destructive hover:underline font-medium"
                      >
                        {contact.phone}
                      </a>
                    </td>
                    <td className="py-2.5 text-muted-foreground">{contact.locations_served}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmergencyContacts;
