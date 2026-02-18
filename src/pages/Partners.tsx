import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Handshake, Building2, Heart, Globe, CheckCircle, ArrowRight, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useContentValue } from "@/hooks/useSiteContent";

const partnerIcons = [Building2, Heart, Globe];

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

  // CMS content with fallbacks
  const heroTitle = useContentValue('partners_hero_title', { text: 'For Partners & Collaborators' })?.text;
  const heroSubtitle = useContentValue('partners_hero_subtitle', { text: 'Join the GLO coordination network operated by Glomera Operations Ltd. Partner with us to reach women across Kenya through secure, dignified referrals.' })?.text;
  const contactEmail = useContentValue('partners_contact_email', { text: 'founder@projectglo.org' })?.text;

  const ngoCard = useContentValue('partners_ngo_card', {
    title: "NGO & Service Providers",
    description: "Join the GLO coordination network. Get platform access to manage referrals, track cases, and measure impact. Platform subscriptions from $299/month (Community tier) to $899/month (Professional tier).",
    links: [{ label: "View Full Pricing", href: "/contact" }, { label: "Start Free Trial", href: "/contact" }]
  });
  const corporateCard = useContentValue('partners_corporate_card', {
    title: "Corporate Sponsors & CSR Programs",
    description: "Fund platform access for partner NGOs or sponsor feature development. Sponsorships from $5,000.",
    links: [{ label: "Explore CSR Partnerships", href: "/contact" }]
  });
  const academicCard = useContentValue('partners_academic_card', {
    title: "Research & Academic",
    description: "Collaborate on research exploring AI, social justice, and community empowerment. From $300 per deliverable.",
    links: []
  });

  const partnershipTypes = [ngoCard, corporateCard, academicCard];

  const currentPartners = useContentValue('partners_current_partners', {
    items: [
      { name: "OBREAL", location: "Spain", description: "International research collaboration" },
      { name: "OBREAL & AAU Youth Incubator", location: "2024/2025 Cohort", description: "Innovation incubator program" }
    ]
  })?.items || [];

  const benefits = useContentValue('partners_benefits', {
    items: [
      "Direct impact on vulnerable communities",
      "Transparent reporting and metrics",
      "Collaboration with AI-for-good initiatives",
      "Recognition and visibility",
      "Access to community insights",
      "Joint research opportunities",
    ]
  })?.items || [];

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
            {heroTitle}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            {heroSubtitle}
          </p>
          <Button size="lg" asChild>
            <Link to="/partner-register">
              Apply to Partner <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Partnership Types */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Platform Access & Partnerships</h2>
            <p className="text-lg text-muted-foreground">
              Join the GLO coordination network with platform subscriptions or sponsorship opportunities
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {partnershipTypes.map((type, index) => {
              const Icon = partnerIcons[index] || Globe;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{type.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base mb-4">{type.description}</CardDescription>
                    {type.links && type.links.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-2">
                        {type.links.map((link: any, linkIndex: number) => (
                          <Button key={linkIndex} variant="outline" size="sm" asChild>
                            <Link to={link.href}>{link.label}</Link>
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Current Partners */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-8">Our Partners</h2>
          
          <div className="flex flex-wrap justify-center gap-6">
            {currentPartners.map((partner: any, index: number) => (
              <Card key={index} className="px-8 py-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-foreground mb-1">{partner.name}</h3>
                  <p className="text-muted-foreground">{partner.location}</p>
                  <p className="text-sm text-muted-foreground mt-2">{partner.description}</p>
                </div>
              </Card>
            ))}
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
            {benefits.map((benefit: string, index: number) => (
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
              href={`mailto:${contactEmail}`}
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <Mail className="h-4 w-4" />
              {contactEmail}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Partners;
