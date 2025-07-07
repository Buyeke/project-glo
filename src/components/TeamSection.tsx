
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const TeamSection = () => {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Our Team</h2>
        </div>
        
        {/* Founder Profile */}
        <div className="flex justify-center mb-12">
          <Card className="max-w-2xl bg-card border-border">
            <CardContent className="p-8 text-center">
              <div className="w-32 h-32 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                <div className="text-4xl font-bold text-accent">DB</div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Dinah Buyeke Masanda</h3>
              <p className="text-lg text-accent font-semibold mb-4">Founder & Project Lead</p>
              <p className="text-base text-muted-foreground leading-relaxed">
                Dinah Buyeke Masanda is the founder of Glo, an AI-powered platform connecting homeless women and children in Kenya to trauma-informed care and support services. 
                She's passionate about building inclusive, ethical technologies rooted in care and community. Her research interests include gendered power, digital equity, Afro-feminist urban design, and the intersection of AI and social justice. 
                Dinah is also a poet, a mother, and a 2024 OBREAL & AAU Fellow, committed to reimagining how systems serve — and who they're built for.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Partnership Section */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-foreground mb-6">In partnership with:</h3>
          <div className="space-y-3">
            <p className="text-lg text-muted-foreground font-medium">The Co-operative University of Kenya</p>
            <p className="text-lg text-muted-foreground font-medium">OBREAL (Spain)</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
