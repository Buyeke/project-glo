import { Button } from "@/components/ui/button";
import { Shield, ArrowRight, Heart, Handshake, Info } from "lucide-react";
import { Link } from "react-router-dom";

const MobileHero = () => {
  return (
    <section className="relative py-10 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-[hsl(0,0%,98%)] overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex flex-col items-center text-center gap-6 md:gap-8">
          
          {/* Title */}
          <h1 className="mobile-hero-title text-foreground">
            Find Support Safely
          </h1>
          
          {/* Subtitle */}
          <p className="mobile-hero-subtitle text-muted-foreground max-w-xl">
            Project GLO connects you to verified organizations offering shelter, legal aid, counseling, and employment support across Kenya.
          </p>
          
          {/* Dual audience paths */}
          <div className="w-full max-w-sm mt-2 space-y-3">
            <Button 
              asChild 
              size="lg" 
              className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
            >
              <Link to="/services" className="flex items-center justify-center gap-3">
                <Heart className="h-5 w-5" aria-hidden="true" />
                <span>I Need Support</span>
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground">
              No login required · Browse anonymously
            </p>
          </div>
          
          {/* For organizations */}
          <div className="w-full max-w-sm flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              asChild 
              className="flex-1 h-11 text-sm font-medium border-border text-muted-foreground hover:text-foreground"
            >
              <Link to="/partners" className="flex items-center justify-center gap-2">
                <Handshake className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span>For Organizations</span>
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              asChild 
              className="flex-1 h-11 text-sm font-medium border-border text-muted-foreground hover:text-foreground"
            >
              <Link to="/about" className="flex items-center justify-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span>About Project GLO</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MobileHero;
