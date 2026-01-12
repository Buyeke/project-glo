import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Compass, Shield, Clock } from "lucide-react";

const FeaturesBenefits = () => {
  const features = [
    {
      icon: MessageCircle,
      title: "Multilingual AI Chat",
      description: "Chat in English, Swahili, or Sheng and get guidance day or night.",
      highlight: "3 Languages",
    },
    {
      icon: Compass,
      title: "Smart Service Matching",
      description: "We connect you with the right support based on your needs and location.",
      highlight: "Personalized",
    },
    {
      icon: Shield,
      title: "Your Data is Protected",
      description: "Information is encrypted and only accessible by approved support staff.",
      highlight: "Confidential",
    },
    {
      icon: Clock,
      title: "Always Here for You",
      description: "AI support anytime with human follow-up during service hours.",
      highlight: "24/7 Access",
    },
  ];

  return (
    <section className="mobile-section-compact md:mobile-section bg-background">
      <div className="max-w-6xl mx-auto mobile-container">
        <div className="text-center mb-4 md:mb-8">
          <h2 className="text-xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">
            How We Support You
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Support Designed With Your Safety and Dignity in Mind
          </p>
        </div>
        
        {/* Mobile: 1 column, Tablet: 2 columns, Desktop: 4 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-lg hover:border-primary/30 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-2 right-2">
                <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                  {feature.highlight}
                </span>
              </div>
              <CardHeader className="pt-8 md:pt-6 pb-1">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 md:mb-3 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-5 w-5 md:h-6 md:w-6 text-primary" aria-hidden="true" />
                </div>
                <CardTitle className="text-base font-bold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesBenefits;
