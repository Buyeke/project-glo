import { Button } from "@/components/ui/button";
import { Shield, ArrowRight, Heart, Handshake, Gift } from "lucide-react";
import { Link } from "react-router-dom";
import HowGLOWorksModal from "./HowGLOWorksModal";

const MobileHero = () => {
  return (
    <section className="relative py-8 md:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 via-background to-background overflow-hidden">
      {/* Background decoration - lighter on mobile for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 md:w-80 md:h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 md:w-80 md:h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Mobile-first: Stack everything vertically */}
        <div className="flex flex-col items-center text-center gap-6 md:gap-8">
          
          {/* Badge - smaller on mobile */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-primary/10 rounded-full">
            <Heart className="h-4 w-4 text-primary" aria-hidden="true" />
            <span className="text-sm font-semibold text-primary">
              AI-Powered Support for Vulnerable Women in Kenya
            </span>
          </div>
          
          {/* Title - Mobile first sizing */}
          <h1 className="mobile-hero-title text-foreground">
            Find Support{" "}
            <span className="text-primary block md:inline">Safely and Confidentially</span>
          </h1>
          
          {/* Subtitle */}
          <p className="mobile-hero-subtitle text-muted-foreground max-w-2xl">
            Chat in English, Swahili, or Sheng to connect with trauma-informed care anytime.
          </p>
          
          {/* PRIMARY CTA - Huge on mobile */}
          <div className="w-full max-w-md mt-2">
            <Button 
              asChild 
              size="lg" 
              className="mobile-cta-primary bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
            >
              <Link to="/services" className="flex items-center justify-center gap-3">
                <Heart className="h-6 w-6" aria-hidden="true" />
                <span>I Need Support</span>
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground mt-3 font-medium">
              Find safe shelter, legal aid, jobs, or counseling
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Start in 60 seconds. No login required.
            </p>
          </div>
          
          {/* Secondary CTAs - Stacked on mobile, side by side on tablet+ */}
          <div className="w-full max-w-md flex flex-col sm:flex-row gap-3 mt-4">
            <Button 
              variant="outline" 
              asChild 
              className="flex-1 h-14 text-base font-semibold touch-button"
            >
              <Link to="/partners" className="flex items-center justify-center gap-2">
                <Handshake className="h-5 w-5" aria-hidden="true" />
                <span>I Want to Partner</span>
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              asChild 
              className="flex-1 h-14 text-base font-semibold touch-button"
            >
              <Link to="/donate" className="flex items-center justify-center gap-2">
                <Gift className="h-5 w-5" aria-hidden="true" />
                <span>I Want to Donate</span>
              </Link>
            </Button>
          </div>
          
          {/* How GLO Works - Easy access */}
          <div className="mt-2">
            <HowGLOWorksModal 
              trigger={
                <Button variant="ghost" className="text-primary font-semibold">
                  See How GLO Works →
                </Button>
              }
            />
          </div>
          
          {/* Trust Signal */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
            <Shield className="h-4 w-4 text-primary" aria-hidden="true" />
            <span className="font-medium">Your data is confidential and protected</span>
            <span className="text-muted-foreground/50">•</span>
            <Link to="/privacy-policy" className="underline hover:text-foreground transition-colors font-medium">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MobileHero;