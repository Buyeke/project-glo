import { Button } from "@/components/ui/button";
import { Shield, ArrowRight, Heart, Handshake, Info } from "lucide-react";
import { Link } from "react-router-dom";

const MobileHero = () => {
  return (
    <section className="relative py-6 md:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 via-background to-background overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 md:w-80 md:h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 md:w-80 md:h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex flex-col items-center text-center gap-4 md:gap-5">
          
          {/* Title */}
          <h1 className="mobile-hero-title text-foreground">
            Find Support{" "}
            <span className="text-primary block md:inline">Safely</span>
          </h1>
          
          {/* Subtitle - concise */}
          <p className="mobile-hero-subtitle text-muted-foreground max-w-xl">
            Project GLO connects you to verified partner organizations across Kenya.
          </p>
          
          {/* PRIMARY CTA */}
          <div className="w-full max-w-sm">
            <Button 
              asChild 
              size="lg" 
              className="mobile-cta-primary bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
            >
              <Link to="/services" className="flex items-center justify-center gap-3">
                <Heart className="h-5 w-5" aria-hidden="true" />
                <span>Get Support</span>
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              No login required · Confidential
            </p>
          </div>
          
          {/* Secondary CTAs - 2 focused actions */}
          <div className="w-full max-w-sm flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              asChild 
              className="flex-1 h-11 text-sm font-medium"
            >
              <Link to="/partners" className="flex items-center justify-center gap-2">
                <Handshake className="h-4 w-4" aria-hidden="true" />
                <span>Partner With Us</span>
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              asChild 
              className="flex-1 h-11 text-sm font-medium"
            >
              <Link to="/about" className="flex items-center justify-center gap-2">
                <Info className="h-4 w-4" aria-hidden="true" />
                <span>Learn More</span>
              </Link>
            </Button>
          </div>
          
          {/* Trust Signal - minimal */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span>Data encrypted · Partner-delivered services</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MobileHero;
