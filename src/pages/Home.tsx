import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import SocialProofBar from "@/components/home/SocialProofBar";
import FeaturesBenefits from "@/components/home/FeaturesBenefits";
import MobileSupportQuiz from "@/components/quiz/MobileSupportQuiz";
import MobileHero from "@/components/home/MobileHero";
import HowItWorksSteps from "@/components/home/HowItWorksSteps";

const Home = () => {
  return (
    <div className="min-h-screen prevent-overflow has-bottom-nav md:has-bottom-nav-none">
      {/* Hero - Primary CTAs */}
      <MobileHero />

      {/* How It Works - Consolidated */}
      <HowItWorksSteps />

      {/* Features - Compact */}
      <FeaturesBenefits />

      {/* Social Proof - Minimal */}
      <SocialProofBar />

      {/* Support Quiz */}
      <section className="py-6 md:py-8 bg-muted/30">
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          <h2 className="text-lg font-bold text-foreground text-center mb-1">
            Find Partner Organizations
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Answer a few questions to get matched
          </p>
          <MobileSupportQuiz />
        </div>
      </section>

      {/* For Employers - Compact */}
      <section className="py-6 md:py-8 bg-background">
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          <Card className="p-4 border-primary/20">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-foreground">For Employers</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Post dignified work opportunities · $30 for 30 days
                </p>
                <Button asChild size="sm" variant="outline">
                  <Link to="/careers">
                    Post a Job
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Final CTA - Focused */}
      <section className="py-6 md:py-8 bg-primary">
        <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-lg font-bold text-primary-foreground mb-2">
            Ready to Connect?
          </h2>
          <p className="text-sm text-primary-foreground/90 mb-4">
            AI-powered matching · Partner-delivered services
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button variant="secondary" size="sm" asChild>
              <Link to="/services">
                Browse Services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" 
              asChild
            >
              <Link to="/about">About GLO</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
