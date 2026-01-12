import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import SocialProofBar from "@/components/home/SocialProofBar";
import FeaturesBenefits from "@/components/home/FeaturesBenefits";
import ImpactTestimonial from "@/components/home/ImpactTestimonial";
import SupportQuiz from "@/components/quiz/SupportQuiz";
import DonationForm from "@/components/donation/DonationForm";
import VisitorPathSelector from "@/components/home/VisitorPathSelector";
import HowItWorksSteps from "@/components/home/HowItWorksSteps";

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Clear Visitor Segmentation */}
      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 via-background to-background overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Support for Vulnerable Women in Kenya</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Find Support,{" "}
              <span className="text-primary">Safely & Confidentially</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto leading-relaxed">
              Chat in English, Swahili, or Sheng to connect with trauma-informed care—whenever you need it.
            </p>
          </div>
          
          {/* Three-Path Visitor Selector */}
          <VisitorPathSelector />
        </div>
      </section>

      {/* How It Works - Immediately visible with modal trigger */}
      <HowItWorksSteps showModalTrigger={true} />

      {/* Social Proof Bar */}
      <SocialProofBar />

      {/* Features - Benefit-Focused */}
      <FeaturesBenefits />

      {/* Interactive Support Quiz Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Find Your Nearest Safe Space
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Answer a few quick questions and we'll help you find the right support 
                based on your unique situation. No judgment, just care.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Tell us what you need</p>
                    <p className="text-sm text-muted-foreground">Housing, legal help, jobs, or emotional support</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Get matched with services</p>
                    <p className="text-sm text-muted-foreground">We connect you with verified local resources</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Receive ongoing support</p>
                    <p className="text-sm text-muted-foreground">Our team follows up to ensure you get help</p>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                No login required to explore services
              </p>
            </div>
            
            <div>
              <SupportQuiz />
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions - Updated CTAs */}
      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* For Individuals/NGOs */}
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold text-foreground mb-3">For Support Seekers & NGOs</h3>
              <p className="text-muted-foreground mb-6">
                Track cases, measure impact, and manage support efficiently with our 
                intuitive dashboard designed for both individuals and organizations.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Real-time case tracking
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Service request management
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Impact metrics & reporting
                </li>
              </ul>
              <Button variant="outline" asChild>
                <Link to="/services">
                  Browse Available Services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </Card>

            {/* For Employers */}
            <Card className="p-8 hover:shadow-lg transition-shadow border-primary/20">
              <h3 className="text-2xl font-bold text-foreground mb-3">For Employers</h3>
              <p className="text-muted-foreground mb-6">
                Post social-impact jobs with secure PayPal payments. Support vulnerable 
                women seeking dignified employment opportunities.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Post social impact jobs for $30 (30-day listing)
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Option for anonymous listings
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Secure PayPal payments
                </li>
              </ul>
              <Button asChild>
                <Link to="/careers">
                  View Job Posting Options
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonial + Donation Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Support Our Mission
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every contribution helps vulnerable women access stability, safety, 
              and opportunities for a better future.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <ImpactTestimonial />
              
              <Card className="bg-primary text-primary-foreground">
                <CardContent className="p-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">200+</div>
                      <div className="text-sm opacity-90">Women Supported</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">15+</div>
                      <div className="text-sm opacity-90">Partner Organizations</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">3</div>
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

      {/* Final CTA - Updated language */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Explore Your Options?</h2>
              <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
                Whether you need immediate help or want to explore available resources, 
                AI support is available anytime, with human follow-up during service hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="secondary" size="lg" asChild>
                  <Link to="/services">
                    Browse Services
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" 
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
