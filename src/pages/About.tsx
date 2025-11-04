
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Users, Globe, ArrowRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            About Project Glo
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            An AI-powered platform connecting homeless women and children in Kenya 
            to trauma-informed care and support services through inclusive, ethical technology.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">Our Mission</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground leading-relaxed">
                  To build inclusive, ethical technologies rooted in care and community that 
                  connect vulnerable women and children to trauma-informed support services, 
                  reimagining how systems serve and who they're built for.
                </p>
              </CardContent>
            </Card>

            <Card>
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
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
              <p className="text-lg text-muted-foreground">Trauma-Informed</p>
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
            <Card className="text-center">
              <CardHeader>
                <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Trauma-Informed Care</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Every interaction is designed with trauma-informed principles, 
                  ensuring safety, trustworthiness, and cultural humility in all our services.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Community-Centered</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our technology is built with and for communities, prioritizing 
                  local knowledge, cultural context, and community ownership.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
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

      {/* Research Focus */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">Our Research Focus</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Project Glo's work is grounded in interdisciplinary research that explores 
            the intersection of technology, social justice, and community empowerment.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-foreground mb-2">Gendered Power & Technology</h3>
                <p className="text-sm text-muted-foreground">
                  Examining how gender dynamics shape technology access and design
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-foreground mb-2">Afro-Feminist Urban Design</h3>
                <p className="text-sm text-muted-foreground">
                  Reimagining city spaces through an Afro-feminist lens
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-foreground mb-2">AI & Social Justice</h3>
                <p className="text-sm text-muted-foreground">
                  Building ethical AI systems that advance equity and justice
                </p>
              </CardContent>
            </Card>
            
            <Card>
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

      {/* Founder Information */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">Leadership & Vision</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Project Glo was founded with a vision to reimagine how technology can serve 
            vulnerable communities with dignity, care, and cultural understanding.
          </p>
          
          <Card className="bg-muted/30">
            <CardContent className="p-8">
              <p className="text-muted-foreground leading-relaxed mb-6">
                Our founder brings together expertise in technology, poetry, and community organizing 
                as a 2024 OBREAL & AAU Fellow, committed to building systems that truly serve 
                those who need them most.
              </p>
              
              <Button variant="outline" asChild>
                <Link to="/blog" className="inline-flex items-center">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Meet Our Founder in the Blog
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Partnership */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">Our Partner</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Working together to advance inclusive technology and community empowerment
          </p>
          
          <div className="flex justify-center">
            <Card className="max-w-md">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  OBREAL (Spain)
                </h3>
                <p className="text-muted-foreground">
                  International collaboration advancing educational and research excellence
                </p>
              </CardContent>
            </Card>
          </div>
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
