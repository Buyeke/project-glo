import { MessageCircle, Compass, UserCheck, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import HowGLOWorksModal from "./HowGLOWorksModal";

interface HowItWorksStepsProps {
  variant?: "default" | "compact";
  showModalTrigger?: boolean;
}

const HowItWorksSteps = ({ variant = "default", showModalTrigger = false }: HowItWorksStepsProps) => {
  const steps = [
    {
      number: "1",
      title: "Chat or explore safely",
      description: "Browse services anonymously or chat with our AI assistant",
      icon: MessageCircle,
    },
    {
      number: "2",
      title: "Get matched to services",
      description: "We connect you with verified organizations that can help",
      icon: Compass,
    },
    {
      number: "3",
      title: "A real organization follows up",
      description: "Receive a personalized response within 24 hours",
      icon: UserCheck,
    },
  ];

  if (variant === "compact") {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-center gap-4 sm:gap-8 py-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary">{step.number}</span>
            </div>
            <span className="text-sm font-semibold text-foreground">{step.title}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="mobile-section bg-muted/30">
      <div className="max-w-5xl mx-auto mobile-container">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-3 md:mb-4">
            How It Works
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            Three simple steps to get support
          </p>
        </div>
        
        {/* Mobile: Vertical stack, Desktop: Horizontal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <div key={index} className="flex md:flex-col items-start md:items-center md:text-center gap-4">
              <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <step.icon className="h-7 w-7 md:h-8 md:w-8 text-primary" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 md:justify-center mb-1 md:mb-2">
                  <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    Step {step.number}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1 md:mb-2">{step.title}</h3>
                <p className="text-sm md:text-base text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        {showModalTrigger && (
          <div className="flex justify-center mt-8">
            <HowGLOWorksModal 
              trigger={
                <Button variant="outline" className="h-12 px-6 text-base font-semibold gap-2">
                  <Play className="h-4 w-4" />
                  Watch Explainer
                </Button>
              }
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default HowItWorksSteps;
