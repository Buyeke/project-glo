import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users, Globe, ArrowRight, BookOpen, Award, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Our Story</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            About Project GLO
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Project GLO is a coordination platform that connects women seeking support with verified organizations offering shelter, legal aid, counseling, and employment services across Kenya. We use multilingual chat tools (English, Swahili, and Sheng) to make finding help easier and more accessible.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Our Mission</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground leading-relaxed">
                  To build inclusive, ethical technology infrastructure rooted in care and community that 
                  connects women to independent, verified organizations providing trauma-informed support, strengthening 
                  outcomes for their families and reimagining how systems serve.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Our Vision</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground leading-relaxed">
                  A world where technology infrastructure enables dignified access to support services, 
                  through community-centered design that advances social justice 
                  and digital equity for all.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What We Actually Do */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">What GLO Does</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're an early-stage platform building coordination infrastructure for social services in Kenya
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-2">For Women Seeking Support</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Browse partner services anonymously — no login required</li>
                  <li>• Chat with our multilingual assistant (English, Swahili, Sheng)</li>
                  <li>• Get matched to relevant organizations based on your needs</li>
                  <li>• Request referrals to verified partner organizations</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-2">For Organizations</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• List your services on our partner directory</li>
                  <li>• Receive coordinated referrals from the platform</li>
                  <li>• Access case management and intake tools</li>
                  <li>• Track impact across your service delivery</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-4 text-sm text-muted-foreground bg-background px-6 py-3 rounded-lg border">
              <span><strong>Founded:</strong> 2024</span>
              <span className="text-border">·</span>
              <span><strong>Stage:</strong> Early-stage</span>
              <span className="text-border">·</span>
              <span><strong>Languages:</strong> 3</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide our work and shape our technology
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Heart className="h-7 w-7 text-primary" />
                </div>
                <CardTitle>Trauma-Informed Care</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Every interaction is designed with trauma-informed principles, 
                  ensuring safety, trustworthiness, and cultural humility across our coordination platform.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <CardTitle>Community-Centered</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our technology is built with and for communities, prioritizing 
                  local knowledge, cultural context, and community ownership.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Globe className="h-7 w-7 text-primary" />
                </div>
                <CardTitle>Digital Equity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We work to bridge digital divides and ensure that technology 
                  serves as a tool for empowerment, not exclusion.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Meet Our Founder</h2>
          </div>
          
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-3 gap-0">
                <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-8 flex items-center justify-center">
                  <div className="h-32 w-32 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="h-16 w-16 text-primary/60" />
                  </div>
                </div>
                
                <div className="md:col-span-2 p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-primary">OBREAL & AAU Youth Incubator (2024/2025 · 2025/2026)</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    Building Technology Rooted in Care
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Our founder brings together expertise in technology, poetry, and community organizing. 
                    As a participant in the OBREAL & AAU Youth Incubator, she is committed to building systems 
                    that truly serve those who need them most—reimagining how technology can advance social justice 
                    and empower vulnerable communities.
                  </p>
                  
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    With a deep understanding of gendered power dynamics, digital equity, and Afro-feminist 
                    urban design, she leads Project GLO's mission to create technology rooted in care, 
                    community, and cultural understanding.
                  </p>
                  
                  <Button variant="outline" asChild>
                    <Link to="/blog" className="inline-flex items-center">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Read More in Our Blog
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Research Focus */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">Our Research Focus</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Project GLO's work is grounded in interdisciplinary research that explores 
            the intersection of technology, social justice, and community empowerment.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-foreground mb-2">Gendered Power & Technology</h3>
                <p className="text-sm text-muted-foreground">
                  Examining how gender dynamics shape technology access and design
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-foreground mb-2">Afro-Feminist Urban Design</h3>
                <p className="text-sm text-muted-foreground">
                  Reimagining city spaces through an Afro-feminist lens
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-foreground mb-2">Multilingual Technology</h3>
                <p className="text-sm text-muted-foreground">
                  Building accessible tools in English, Swahili, and Sheng
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-foreground mb-2">Digital Equity</h3>
                <p className="text-sm text-muted-foreground">
                  Ensuring technology serves everyone, especially the marginalized
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Partnership */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">Backed By</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Incubated and supported by international partners
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <Card className="px-8 py-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-foreground mb-1">OBREAL</h3>
                <p className="text-muted-foreground">Spain</p>
              </div>
            </Card>
            <Card className="px-8 py-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-foreground mb-1">OBREAL & AAU Youth Incubator</h3>
                <p className="text-muted-foreground">2024/2025 · 2025/2026 Cohorts</p>
              </div>
            </Card>
          </div>
          
          <Button variant="outline" asChild>
            <Link to="/partners">
              Become a Partner
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* About Glomera Operations Ltd */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">About Glomera Operations Ltd</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-4">
            Glomera Operations Ltd is a Kenya-registered social impact technology company dedicated to building 
            inclusive digital infrastructure that serves vulnerable communities.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Project GLO is our flagship platform, designed to coordinate secure referrals between women seeking 
            support and independent, verified partner organizations across Kenya.
          </p>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Get Involved</h2>
              <p className="text-lg mb-6 opacity-90">
                Whether you need support or want to join as a partner organization, 
                we're here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="secondary" size="lg" asChild>
                  <Link to="/services">
                    Browse Services <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                  <Link to="/partners">Partner With Us</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default About;
