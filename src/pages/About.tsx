
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, Globe, Shield, Mail, Users as UsersIcon } from "lucide-react";
import TeamSection from "@/components/TeamSection";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            About Project GLO
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're building a world where AI-powered support connects vulnerable communities 
            with the resources they need, when they need them most.
          </p>
        </div>

        {/* Mission Section */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-6 w-6 text-red-500" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Project GLO exists to bridge the gap between those who need support and the 
                organizations that can provide it. Through innovative AI technology and 
                community-driven solutions, we create pathways to assistance that are 
                accessible, culturally sensitive, and effective.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-6 w-6 text-blue-500" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                We envision a future where no one falls through the cracks of support systems. 
                A world where technology serves humanity by making help more accessible, 
                efficient, and dignified for everyone, regardless of their circumstances.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="h-8 w-8 text-green-500" />,
                title: "Privacy & Security",
                description: "We prioritize the protection of user data and maintain the highest standards of privacy and security in all our operations."
              },
              {
                icon: <Users className="h-8 w-8 text-purple-500" />,
                title: "Community-Centered",
                description: "Our solutions are designed with and for the communities we serve, ensuring cultural sensitivity and local relevance."
              },
              {
                icon: <Heart className="h-8 w-8 text-red-500" />,
                title: "Dignity & Respect",
                description: "Every interaction is built on respect for human dignity, treating each person with the care and consideration they deserve."
              }
            ].map((value, index) => (
              <Card key={index} className="text-center border-0 shadow-lg">
                <CardHeader>
                  <div className="flex justify-center mb-4">{value.icon}</div>
                  <CardTitle>{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Impact Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Impact</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { number: "10,000+", label: "People Connected to Resources" },
              { number: "500+", label: "Partner Organizations" },
              { number: "50+", label: "Communities Served" },
              { number: "15", label: "Languages Supported" }
            ].map((stat, index) => (
              <Card key={index} className="text-center border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
                  <p className="text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <Card className="mb-16 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-6 w-6 text-blue-500" />
              Get in Touch
            </CardTitle>
            <CardDescription>
              We're here to help and answer any questions you may have
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  General Inquiries
                </h4>
                <p className="text-muted-foreground mb-4">
                  For general questions, support requests, or information about our services:
                </p>
                <Badge variant="outline" className="text-sm">
                  info@projectglo.org
                </Badge>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <UsersIcon className="h-4 w-4" />
                  Partnerships & Grants
                </h4>
                <p className="text-muted-foreground mb-4">
                  For partnership opportunities, grant applications, or collaboration inquiries:
                </p>
                <Badge variant="outline" className="text-sm">
                  founder@projectglo.org
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Section */}
        <TeamSection />
      </div>
    </div>
  );
};

export default About;
