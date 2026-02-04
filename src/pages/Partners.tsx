import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Handshake, Building2, Heart, Globe, CheckCircle, ArrowRight, Mail } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Partners = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    organization: "",
    email: "",
    partnerType: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("contact_submissions").insert({
        name: `${formData.name} - ${formData.organization}`,
        email: formData.email,
        message: `[Partnership Inquiry - ${formData.partnerType}]\n\n${formData.message}`,
        status: "new",
      });

      if (error) throw error;

      toast({
        title: "Thank you for your interest!",
        description: "We'll review your partnership inquiry and get back to you soon.",
      });

      setFormData({ name: "", organization: "", email: "", partnerType: "", message: "" });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an issue submitting your inquiry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const partnershipTypes = [
    {
      icon: Building2,
      title: "NGO & Service Providers",
      description: "Join the GLO coordination network. Receive secure referrals from our AI-powered platform. Partnerships from $500/month.",
    },
    {
      icon: Heart,
      title: "Corporate Sponsors",
      description: "Support platform development and infrastructure through sponsorship or employee engagement. From $10,000 (one-off or semi-annual).",
    },
    {
      icon: Globe,
      title: "Research & Academic",
      description: "Collaborate on research exploring AI, social justice, and community empowerment. From $300 per deliverable.",
    },
  ];

  const benefits = [
    "Direct impact on vulnerable communities",
    "Transparent reporting and metrics",
    "Collaboration with AI-for-good initiatives",
    "Recognition and visibility",
    "Access to community insights",
    "Joint research opportunities",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Handshake className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Partner With Us</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            For Partners & Collaborators
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join the GLO coordination network operated by Glomera Operations Ltd. Partner with us to reach women across Kenya through secure, dignified referrals.
          </p>
        </div>
      </section>

      {/* Partnership Types */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Partnership Opportunities</h2>
            <p className="text-lg text-muted-foreground">
              Different ways to collaborate with Project GLO
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {partnershipTypes.map((type, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <type.icon className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{type.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{type.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Current Partners */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-8">Our Partners</h2>
          
          <div className="flex flex-wrap justify-center gap-6">
            <Card className="px-8 py-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-foreground mb-1">OBREAL</h3>
                <p className="text-muted-foreground">Spain</p>
                <p className="text-sm text-muted-foreground mt-2">
                  International research collaboration
                </p>
              </div>
            </Card>
            <Card className="px-8 py-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-foreground mb-1">OBREAL & AAU Youth Incubator</h3>
                <p className="text-muted-foreground">2024/2025 Cohort</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Innovation incubator program
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Partner With Us</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-background rounded-lg border">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-background">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Become a Partner</CardTitle>
              <CardDescription>
                Tell us about your organization and how you'd like to collaborate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organization *</Label>
                    <Input
                      id="organization"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partnerType">Partnership Type *</Label>
                  <Select
                    value={formData.partnerType}
                    onValueChange={(value) => setFormData({ ...formData, partnerType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select partnership type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ngo">NGO / Service Provider</SelectItem>
                      <SelectItem value="corporate">Corporate Sponsor</SelectItem>
                      <SelectItem value="academic">Research / Academic</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">How would you like to partner with us? *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    required
                  />
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Partnership Inquiry"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Direct Contact */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-2">Or reach us directly:</p>
            <a 
              href="mailto:founder@projectglo.org" 
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <Mail className="h-4 w-4" />
              founder@projectglo.org
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Partners;
