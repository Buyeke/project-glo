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
            About Project Glo
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            An AI-powered platform connecting vulnerable women in Kenya 
            to trauma-informed care and support services through inclusive, ethical technology.
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
                  To build inclusive, ethical technologies rooted in care and community that 
                  connect vulnerable women to trauma-informed support services, strengthening 
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
                  A world where AI serves everyone, especially the most vulnerable, 
                  through community-centered design that advances social justice 
                  and digital equity for all.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Impact</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Supporting vulnerable communities through technology and care
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">200+</div>
              <p className="text-lg text-muted-foreground">Women Supported</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <p className="text-lg text-muted-foreground">AI Guided Support</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">3</div>
              <p className="text-lg text-muted-foreground">Languages</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">2024</div>
              <p className="text-lg text-muted-foreground">Founded</p>
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
                  ensuring safety, trustworthiness, and cultural humility in all our services.
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

      {/* Founder Section - Expanded */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Meet Our Founder</h2>
          </div>
          
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-3 gap-0">
                {/* Photo Placeholder */}
                <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-8 flex items-center justify-center">
                  <div className="h-32 w-32 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="h-16 w-16 text-primary/60" />
                  </div>
                </div>
                
                {/* Bio */}
                <div className="md:col-span-2 p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-primary">OBREAL & AAU Youth Incubator (2024/2025)</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    Visionary Leader in AI for Social Good
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Our founder brings together expertise in technology, poetry, and community organizing. 
                    As a participant in the OBREAL & AAU Youth Incubator, she is committed to building systems 
                    that truly serve those who need them most—reimagining how AI can advance social justice 
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
            Project Glo's work is grounded in interdisciplinary research that explores 
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
                <h3 className="font-semibold text-foreground mb-2">AI & Social Justice</h3>
                <p className="text-sm text-muted-foreground">
                  Building ethical AI systems that advance equity and justice
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
          <h2 className="text-3xl font-bold text-foreground mb-6">Our Partners</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Working together to advance inclusive technology and community empowerment
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
                <p className="text-muted-foreground">2024/2025 Cohort</p>
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

      {/* Call to Action */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Join Our Mission</h2>
              <p className="text-lg mb-6 opacity-90">
                Whether you need support or want to contribute to our work, 
                we're here to connect and collaborate.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="secondary" size="lg" asChild>
                  <Link to="/contact">
                    Get In Touch <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                  <Link to="/services">Explore Services</Link>
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
