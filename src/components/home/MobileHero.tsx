import { Button } from "@/components/ui/button";
import { Shield, ArrowRight, Heart, Handshake, Info } from "lucide-react";
import { Link } from "react-router-dom";

const MobileHero = () => {
  return (
    <section className="relative py-10 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-[hsl(0,0%,98%)] overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex flex-col items-center text-center gap-6 md:gap-8">
          
          {/* Title - single solid color */}
          <h1 className="mobile-hero-title text-foreground">
            Find Support Safely
          </h1>
          
          {/* Subtitle - more breathing room */}
          <p className="mobile-hero-subtitle text-muted-foreground max-w-xl">
            Project GLO connects you to verified partner organizations across Kenya.
          </p>
          
          {/* PRIMARY CTA - larger and more dominant */}
          <div className="w-full max-w-sm mt-2">
            <Button 
              asChild 
              size="lg" 
              className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
            >
              <Link to="/services" className="flex items-center justify-center gap-3">
                <Heart className="h-5 w-5" aria-hidden="true" />
                <span>Get Support</span>
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground mt-3">
              No login required · Confidential
            </p>
          </div>
          
          {/* Secondary CTAs - clearly subordinate */}
          <div className="w-full max-w-sm flex flex-col sm:flex-row gap-3 mt-2">
            <Button 
              variant="outline" 
              asChild 
              className="flex-1 h-11 text-sm font-medium border-border text-muted-foreground hover:text-foreground"
            >
              <Link to="/partners" className="flex items-center justify-center gap-2">
                <Handshake className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span>Partner With Us</span>
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              asChild 
              className="flex-1 h-11 text-sm font-medium border-border text-muted-foreground hover:text-foreground"
            >
              <Link to="/about" className="flex items-center justify-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span>Learn More</span>
              </Link>
            </Button>
          </div>
          
          {/* Trust Signal - muted icon */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
            <Shield className="h-3.5 w-3.5 text-primary/60" aria-hidden="true" />
            <span>Data encrypted · Partner-delivered services</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MobileHero;
