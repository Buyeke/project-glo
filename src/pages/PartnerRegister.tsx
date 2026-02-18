
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Building2, GraduationCap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TIER_PRICING: Record<string, { name: string; price: string; amount: number; features: string[] }> = {
  pilot: {
    name: "Pilot",
    price: "$2,000/month",
    amount: 2000,
    features: ["Sandbox API access", "Up to 40 students", "Basic analytics", "Email support"],
  },
  essentials: {
    name: "Essentials",
    price: "$2,500/month",
    amount: 2500,
    features: ["Sandbox API access", "Up to 40 students", "Basic analytics", "Email support"],
  },
  standard: {
    name: "Standard",
    price: "$4,000/month",
    amount: 4000,
    features: ["Full API access", "Up to 100 students", "Advanced analytics", "Assignment management", "Priority support"],
  },
  premium: {
    name: "Premium",
    price: "$10,000/month",
    amount: 10000,
    features: ["Full API + custom datasets", "Unlimited students", "Faculty dashboard", "Custom integrations", "Dedicated support"],
  },
};

const PartnerRegister = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    organization_name: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    website: "",
    institution_type: "academic",
    description: "",
    selected_tier: "pilot",
    expected_student_count: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.organization_name || !form.contact_name || !form.contact_email) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);

    try {
      const tier = TIER_PRICING[form.selected_tier];
      const { error } = await supabase.from("partner_applications" as any).insert({
        organization_name: form.organization_name.trim(),
        contact_name: form.contact_name.trim(),
        contact_email: form.contact_email.trim(),
        contact_phone: form.contact_phone.trim() || null,
        website: form.website.trim() || null,
        institution_type: form.institution_type,
        description: form.description.trim() || null,
        selected_tier: form.selected_tier,
        expected_student_count: form.expected_student_count ? parseInt(form.expected_student_count) : null,
        payment_amount: tier.amount,
        status: "pending",
      } as any);

      if (error) throw error;

      // Send confirmation email
      try {
        await supabase.functions.invoke("send-partner-email", {
          body: {
            type: "application_submitted",
            to: form.contact_email.trim(),
            data: { organization_name: form.organization_name, contact_name: form.contact_name },
          },
        });
      } catch {
        // Email failure shouldn't block submission
      }

      setSubmitted(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-lg w-full text-center">
          <CardHeader>
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Application Submitted!</CardTitle>
            <CardDescription className="text-base">
              Thank you for your interest in partnering with GLO. We'll review your application and get back to you within 48 hours.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
              A confirmation email has been sent to <strong>{form.contact_email}</strong>.
            </p>
            <Button asChild>
              <Link to="/partners">Back to Partners</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-12 md:py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Academic Partnership</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Register Your Institution
          </h1>
          <p className="text-lg text-muted-foreground">
            Apply to join the GLO Education API program. Get your students hands-on experience with real-world social impact data.
          </p>
        </div>
      </section>

      {/* Tier Selection */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-foreground mb-8">Choose Your Plan</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(TIER_PRICING).map(([key, tier]) => (
              <Card
                key={key}
                className={`cursor-pointer transition-all ${
                  form.selected_tier === key ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"
                }`}
                onClick={() => setForm((f) => ({ ...f, selected_tier: key }))}
              >
                <CardHeader className="text-center">
                  {key === "standard" && (
                    <Badge className="mx-auto mb-2 w-fit">Most Popular</Badge>
                  )}
                  <CardTitle>{tier.name}</CardTitle>
                  <p className="text-2xl font-bold text-primary">{tier.price}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Institution Details</CardTitle>
              <CardDescription>Fill in your details and we'll set up your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label>Institution Name *</Label>
                  <Input
                    value={form.organization_name}
                    onChange={(e) => setForm((f) => ({ ...f, organization_name: e.target.value }))}
                    placeholder="e.g. Co-operative University of Kenya"
                    required
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Contact Person *</Label>
                    <Input
                      value={form.contact_name}
                      onChange={(e) => setForm((f) => ({ ...f, contact_name: e.target.value }))}
                      placeholder="Full name"
                      required
                    />
                  </div>
                  <div>
                    <Label>Email Address *</Label>
                    <Input
                      type="email"
                      value={form.contact_email}
                      onChange={(e) => setForm((f) => ({ ...f, contact_email: e.target.value }))}
                      placeholder="email@university.ac.ke"
                      required
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Phone (optional)</Label>
                    <Input
                      value={form.contact_phone}
                      onChange={(e) => setForm((f) => ({ ...f, contact_phone: e.target.value }))}
                      placeholder="+254..."
                    />
                  </div>
                  <div>
                    <Label>Website (optional)</Label>
                    <Input
                      value={form.website}
                      onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Institution Type *</Label>
                    <Select value={form.institution_type} onValueChange={(v) => setForm((f) => ({ ...f, institution_type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="academic">Academic / University</SelectItem>
                        <SelectItem value="ngo">NGO / Service Provider</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Expected Number of Students</Label>
                    <Input
                      type="number"
                      value={form.expected_student_count}
                      onChange={(e) => setForm((f) => ({ ...f, expected_student_count: e.target.value }))}
                      placeholder="e.g. 40"
                    />
                  </div>
                </div>
                <div>
                  <Label>How would you like to use GLO data?</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Describe your intended use case, courses, or research goals..."
                    rows={4}
                  />
                </div>

                <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                  <strong>Selected plan:</strong> {TIER_PRICING[form.selected_tier].name} — {TIER_PRICING[form.selected_tier].price}
                  <br />
                  Payment details will be shared after your application is approved.
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default PartnerRegister;
