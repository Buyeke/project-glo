import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Heart, Handshake, Gift, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const VisitorPathSelector = () => {
  const paths = [
    {
      id: "support",
      title: "I need support",
      description: "Get matched with organizations offering shelter, legal aid, jobs, or counseling",
      cta: "Start in 60 seconds. No login required.",
      icon: Heart,
      link: "/services",
      variant: "primary" as const,
    },
    {
      id: "partner",
      title: "I want to partner",
      description: "NGOs, employers, and organizations join here",
      cta: "See partnership options",
      icon: Handshake,
      link: "/partners",
      variant: "secondary" as const,
    },
    {
      id: "donate",
      title: "Support the platform",
      description: "Help sustain the platform and its mission",
      cta: "Contribute now",
      icon: Gift,
      link: "/donate",
      variant: "secondary" as const,
    },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {paths.map((path) => {
          const IconComponent = path.icon;
          const isPrimary = path.variant === "primary";
          
          return (
            <Link key={path.id} to={path.link} className="group">
              <Card 
                className={`h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer ${
                  isPrimary 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-card hover:border-primary/50"
                }`}
              >
                <CardContent className="p-6 flex flex-col h-full">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                    isPrimary 
                      ? "bg-primary-foreground/20" 
                      : "bg-primary/10"
                  }`}>
                    <IconComponent className={`h-6 w-6 ${
                      isPrimary ? "text-primary-foreground" : "text-primary"
                    }`} />
                  </div>
                  
                  <h3 className={`text-xl font-bold mb-2 ${
                    isPrimary ? "text-primary-foreground" : "text-foreground"
                  }`}>
                    {path.title}
                  </h3>
                  
                  <p className={`text-sm mb-4 flex-grow ${
                    isPrimary ? "text-primary-foreground/90" : "text-muted-foreground"
                  }`}>
                    {path.description}
                  </p>
                  
                  <div className={`flex items-center text-sm font-medium group-hover:gap-3 transition-all ${
                    isPrimary ? "text-primary-foreground" : "text-primary"
                  }`}>
                    <span>{path.cta}</span>
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
      
      {/* Privacy reassurance */}
      <div className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground">
        <Shield className="h-4 w-4" />
        <span>Your data is confidential and protected</span>
        <span className="text-muted-foreground/50">•</span>
        <Link to="/privacy-policy" className="underline hover:text-foreground transition-colors">
          Privacy Policy
        </Link>
      </div>
    </div>
  );
};

export default VisitorPathSelector;
