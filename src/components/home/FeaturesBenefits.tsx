import { MessageCircle, Shield, Globe, Search, GraduationCap } from "lucide-react";

const FeaturesBenefits = () => {
  const features = [
    {
      icon: Globe,
      title: "Multilingual",
      description: "English, Swahili, Sheng",
    },
    {
      icon: Shield,
      title: "Private & Secure",
      description: "Encrypted, confidential",
    },
    {
      icon: Search,
      title: "Smart Matching",
      description: "Guided service discovery",
    },
    {
      icon: MessageCircle,
      title: "Multilingual Assistant",
      description: "Guided support in 3 languages",
    },
  ];

  return (
    <section className="py-6 md:py-8 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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

        {/* Credibility strip — replaces separate SocialProofBar */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 pt-3 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <GraduationCap className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span>OBREAL & AAU Incubator</span>
          </div>
          <div className="hidden sm:block w-px h-3 bg-border" />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Operated by Glomera Operations Ltd · Kenya-registered</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesBenefits;
