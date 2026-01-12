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
      <section className="mobile-section bg-muted/30">
        <div className="max-w-6xl mx-auto mobile-container">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Info Column - Hidden on mobile, quiz is self-explanatory */}
            <div className="hidden lg:block">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Find Your Nearest Safe Space
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Answer a few quick questions and we'll guide you to the right support.
                <br />
                <span className="font-semibold">No judgment. No login required.</span>
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Tell us what you need</p>
                    <p className="text-muted-foreground">Housing, legal help, jobs, or emotional support</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Get matched with services</p>
                    <p className="text-muted-foreground">Verified local organizations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">3</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Receive ongoing support</p>
                    <p className="text-muted-foreground">Follow-up to ensure you get help</p>
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
      <section className="mobile-section bg-background">
        <div className="max-w-3xl mx-auto mobile-container">
          <Card className="p-6 md:p-8 hover:shadow-lg transition-shadow border-primary/20">
            <h3 className="text-2xl font-bold text-foreground mb-3">For Employers</h3>
            <p className="text-muted-foreground mb-6 text-lg">
              Post social impact jobs that support vulnerable women.
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-3 text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                <span className="text-base">$30 listing for 30 days</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                <span className="text-base">Option for anonymous listings</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                <span className="text-base">Secure PayPal payments</span>
              </li>
            </ul>
            <Button asChild className="w-full sm:w-auto h-12 text-base font-semibold">
              <Link to="/careers">
                View Job Posting Options
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </Card>
        </div>
      </section>

      {/* Testimonial + Donation Section */}
      <section className="mobile-section bg-muted/30">
        <div className="max-w-6xl mx-auto mobile-container">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Support Our Mission
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every contribution helps women access safety, stability, and opportunity.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="space-y-6">
              <ImpactTestimonial />
              
              <Card className="bg-primary text-primary-foreground">
                <CardContent className="p-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl md:text-3xl font-bold">200+</div>
                      <div className="text-sm opacity-90">Women Supported</div>
                    </div>
                    <div>
                      <div className="text-2xl md:text-3xl font-bold">15+</div>
                      <div className="text-sm opacity-90">Partner Organizations</div>
                    </div>
                    <div>
                      <div className="text-2xl md:text-3xl font-bold">3</div>
                      <div className="text-sm opacity-90">Languages Supported</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <DonationForm 
                showImpactItems={false} 
                title="Donate Now – Every Contribution Matters"
                description="Your donation is secure and goes directly to supporting vulnerable communities"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mobile-section bg-background">
        <div className="max-w-4xl mx-auto mobile-container">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-6 md:p-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Explore Your Options?</h2>
              <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
                Whether you need immediate help or want to learn more, AI support is available anytime with human follow-up.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="secondary" size="lg" asChild className="h-12 text-base font-semibold">
                  <Link to="/services">
                    Browse Services
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="h-12 text-base font-semibold bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" 
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