import { MessageCircle, Users, Phone, Play } from "lucide-react";
import HowGLOWorksModal from "./HowGLOWorksModal";
import { Button } from "@/components/ui/button";

interface HowItWorksStepsProps {
  variant?: "default" | "compact";
  showModalTrigger?: boolean;
}

const HowItWorksSteps = ({ variant = "default", showModalTrigger = false }: HowItWorksStepsProps) => {
  const steps = [
    {
      number: 1,
      title: "Chat or explore safely",
      description: "Browse services anonymously or chat with our AI assistant",
      icon: MessageCircle,
    },
    {
      number: 2,
      title: "Get matched to services",
      description: "We connect you with verified organizations that can help",
      icon: Users,
    },
    {
      number: 3,
      title: "A real organization follows up",
      description: "Receive a personalized response within 24 hours",
      icon: Phone,
    },
  ];

  if (variant === "compact") {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 py-4">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{step.number}</span>
              </div>
              <span className="text-sm font-medium text-foreground">{step.title}</span>
            </div>
            {index < steps.length - 1 && (
              <div className="hidden sm:block w-8 h-px bg-border" />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="py-12 bg-muted/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            How It Works
          </h2>
          <p className="text-muted-foreground mb-4">
            Three simple steps to get the support you need
          </p>
          {showModalTrigger && (
            <HowGLOWorksModal 
              trigger={
                <Button variant="outline" size="sm" className="gap-2">
                  <Play className="h-4 w-4" />
                  Watch Explainer
                </Button>
              }
            />
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            
            return (
              <div key={step.number} className="relative">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
                )}
                
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <IconComponent className="h-7 w-7 text-primary" />
                    </div>
                    <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {step.number}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground max-w-xs">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSteps;
