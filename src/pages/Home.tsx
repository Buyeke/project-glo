import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import SocialProofBar from "@/components/home/SocialProofBar";
import FeaturesBenefits from "@/components/home/FeaturesBenefits";
import ImpactTestimonial from "@/components/home/ImpactTestimonial";
import MobileSupportQuiz from "@/components/quiz/MobileSupportQuiz";
import DonationForm from "@/components/donation/DonationForm";
import MobileHero from "@/components/home/MobileHero";
import HowItWorksSteps from "@/components/home/HowItWorksSteps";

const Home = () => {
  return (
    <div className="min-h-screen prevent-overflow has-bottom-nav md:has-bottom-nav-none">
      {/* Hero Section - Mobile-first with prominent CTA */}
      <MobileHero />

      {/* How It Works - Immediately visible with modal trigger */}
      <HowItWorksSteps showModalTrigger={true} />

      {/* Social Proof Bar */}
      <SocialProofBar />

      {/* Features - Benefit-Focused */}
      <FeaturesBenefits />

      {/* Interactive Support Quiz Section - Mobile Optimized */}
      <section className="mobile-section-compact md:mobile-section bg-muted/30">
        <div className="max-w-6xl mx-auto mobile-container">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-start">
            {/* Info Column - Hidden on mobile, quiz is self-explanatory */}
            <div className="hidden lg:block">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                Find Your Nearest Safe Space
              </h2>
              <p className="text-base text-muted-foreground mb-4">
                Answer a few quick questions and we'll match you with verified partner organizations.
                <br />
                <span className="font-semibold">No judgment. No login required.</span>
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Tell us what you need</p>
                    <p className="text-muted-foreground text-sm">Housing, legal help, jobs, or emotional support</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Get matched to partner organizations</p>
                    <p className="text-muted-foreground text-sm">Verified, independent providers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Receive ongoing support</p>
                    <p className="text-muted-foreground text-sm">Follow-up to ensure you get help</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quiz - Full width on mobile */}
            <div className="w-full">
              <MobileSupportQuiz />
            </div>
          </div>
        </div>
      </section>

      {/* For Employers Section */}
      <section className="mobile-section-compact md:mobile-section bg-background">
        <div className="max-w-3xl mx-auto mobile-container">
          <Card className="p-4 md:p-6 hover:shadow-lg transition-shadow border-primary/20">
            <h3 className="text-xl font-bold text-foreground mb-2">For Employers</h3>
            <p className="text-muted-foreground mb-4 text-base">
              Post dignified work opportunities through our partner network.
            </p>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center gap-2 text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="text-sm">$30 listing for 30 days</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="text-sm">Option for anonymous listings</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="text-sm">Secure PayPal payments</span>
              </li>
            </ul>
            <Button asChild className="w-full sm:w-auto h-11 text-sm font-semibold">
              <Link to="/careers">
                View Job Posting Options
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </Card>
        </div>
      </section>

      {/* Testimonial + Donation Section */}
      <section className="mobile-section-compact md:mobile-section bg-muted/30">
        <div className="max-w-6xl mx-auto mobile-container">
          <div className="text-center mb-4 md:mb-6">
            <h2 className="text-xl md:text-3xl font-bold text-foreground mb-2">
              Support the Platform
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              Your contribution helps sustain the platform and its coordination network.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-4 lg:gap-8">
            <div className="space-y-4">
              <ImpactTestimonial />
              
              <Card className="bg-primary text-primary-foreground">
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-xl md:text-2xl font-bold">200+</div>
                      <div className="text-xs opacity-90">Women Supported</div>
                    </div>
                    <div>
                      <div className="text-xl md:text-2xl font-bold">15+</div>
                      <div className="text-xs opacity-90">Partner Organizations</div>
                    </div>
                    <div>
                      <div className="text-xl md:text-2xl font-bold">3</div>
                      <div className="text-xs opacity-90">Languages Supported</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <DonationForm 
                showImpactItems={false} 
                title="Contribute to the Platform"
                description="Your contribution helps maintain secure referral infrastructure and partner coordination"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mobile-section-compact md:mobile-section bg-background">
        <div className="max-w-4xl mx-auto mobile-container">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-4 md:p-8 text-center">
              <h2 className="text-xl md:text-2xl font-bold mb-2">Ready to Explore Your Options?</h2>
              <p className="text-sm md:text-base mb-4 opacity-90 max-w-2xl mx-auto">
                Whether you need immediate help or want to learn more, AI-powered matching is available anytime. Partner organizations provide follow-up support.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="secondary" size="lg" asChild className="h-11 text-sm font-semibold">
                  <Link to="/services">
                    Browse Services
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="h-11 text-sm font-semibold bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" 
                  asChild
                >
                  <Link to="/resources">Explore Resources</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Home;