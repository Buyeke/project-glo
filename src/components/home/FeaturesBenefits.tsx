import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Compass, Shield, Clock } from "lucide-react";

const FeaturesBenefits = () => {
  const features = [
    {
      icon: MessageCircle,
      title: "Multilingual AI Chat",
      description: "Chat in English, Swahili, or Sheng and get trauma-informed guidance instantly—day or night.",
      highlight: "3 Languages",
    },
    {
      icon: Compass,
      title: "Smart Service Matching",
      description: "We connect you with the right support quickly, based on your unique needs and location.",
      highlight: "Personalized",
    },
    {
      icon: Shield,
      title: "Your Data is Protected",
      description: "Your information is secure, encrypted, and only accessible by approved support staff.",
      highlight: "Confidential",
    },
    {
      icon: Clock,
      title: "Always Here for You",
      description: "24/7 AI support available whenever and wherever you need help—no judgment, just care.",
      highlight: "24/7 Access",
    },
  ];

  return (
    <section className="py-16 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How We Support You
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Support Designed With Your Safety and Dignity in Mind
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-lg hover:border-primary/30 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-2 right-2">
                <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">
                  {feature.highlight}
                </span>
              </div>
              <CardHeader className="pt-8">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
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
