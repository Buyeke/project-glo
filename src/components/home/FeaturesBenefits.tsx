import { MessageCircle, Shield, Clock, Globe } from "lucide-react";

const FeaturesBenefits = () => {
  const features = [
    {
      icon: Globe,
      title: "Multilingual",
      description: "English, Swahili, Sheng",
    },
    {
      icon: Shield,
      title: "Private",
      description: "Encrypted, confidential",
    },
    {
      icon: MessageCircle,
      title: "AI-Guided",
      description: "Smart matching to partners",
    },
    {
      icon: Clock,
      title: "24/7 Access",
      description: "Anytime, anywhere",
    },
  ];

  return (
    <section className="py-6 md:py-8 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/30"
            >
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <feature.icon className="h-4 w-4 text-primary" aria-hidden="true" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesBenefits;
