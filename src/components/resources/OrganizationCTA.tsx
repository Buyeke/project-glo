import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const OrganizationCTA = () => {
  return (
    <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-background">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground mb-2">
              For Organizations: Access Platform Tools
            </h2>
            <p className="text-muted-foreground mb-4">
              Are you an NGO, government agency, or service provider? Access the GLO platform to manage cases, track impact, and coordinate care with AI that speaks authentic Sheng, Swahili, and English.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/dashboard">
                  Access Platform Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/partners">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Explore Partnership Options
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/contact">Book a Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrganizationCTA;
