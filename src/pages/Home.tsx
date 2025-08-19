
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Shield, Globe, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Empowering Communities Through AI-Driven Care
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Project Glo connects homeless women and children in Kenya to trauma-informed care and support services through inclusive, ethical AI technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link to="/contact">Get Support</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Impact</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Building bridges to support and empower vulnerable communities across Kenya
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">300</div>
              <p className="text-lg text-muted-foreground">Women Supported</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <p className="text-lg text-muted-foreground">AI Support Available</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">100%</div>
              <p className="text-lg text-muted-foreground">Trauma-Informed Care</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">How We Help</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform provides comprehensive support through multiple channels
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Heart className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Trauma-Informed Care</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Compassionate support designed with trauma-informed principles at its core
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Community Connection</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Connecting women and children to local resources and support networks
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Safe & Secure</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Privacy-first approach ensuring confidential and secure interactions
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Globe className="h-8 w-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Always Accessible</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  24/7 AI support available whenever and wherever you need help
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
          <p className="text-xl text-muted-foreground leading-relaxed mb-8">
            We believe in building inclusive, ethical technologies rooted in care and community. 
            Our work focuses on reimagining how systems serve and who they're built for, 
            with special attention to gendered power, digital equity, and Afro-feminist urban design.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="flex flex-col items-center">
              <CheckCircle className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Inclusive Technology</h3>
              <p className="text-sm text-muted-foreground">
                Building AI that serves everyone, especially the most vulnerable
              </p>
            </div>
            <div className="flex flex-col items-center">
              <CheckCircle className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Community-Centered</h3>
              <p className="text-sm text-muted-foreground">
                Rooted in care, community input, and cultural understanding
              </p>
            </div>
            <div className="flex flex-col items-center">
              <CheckCircle className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Social Justice</h3>
              <p className="text-sm text-muted-foreground">
                Advancing equity through ethical AI and thoughtful design
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-lg mb-6 opacity-90">
                Connect with our AI-powered platform to access trauma-informed care and support services
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="secondary" size="lg" asChild>
                  <Link to="/contact">
                    Get Support <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                  <Link to="/resources">Browse Resources</Link>
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
