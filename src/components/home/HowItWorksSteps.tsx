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
      title: "Get matched to partner organizations",
      description: "Our platform connects you with verified, independent organizations",
      icon: Compass,
    },
    {
      number: "3",
      title: "A partner organization follows up",
      description: "A trained support worker from a partner organization will reach out",
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
    <section className="mobile-section-compact md:mobile-section bg-muted/30">
      <div className="max-w-5xl mx-auto mobile-container">
        <div className="text-center mb-4 md:mb-8">
          <h2 className="text-xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">
            How It Works
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Three simple steps to get support
          </p>
        </div>
        
        {/* Mobile: Vertical stack, Desktop: Horizontal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {steps.map((step, index) => (
            <div key={index} className="flex md:flex-col items-start md:items-center md:text-center gap-3">
              <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <step.icon className="h-6 w-6 md:h-7 md:w-7 text-primary" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 md:justify-center mb-0.5 md:mb-1">
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    Step {step.number}
                  </span>
                </div>
                <h3 className="text-base font-bold text-foreground mb-0.5">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        {showModalTrigger && (
          <div className="flex justify-center mt-4 md:mt-6">
            <HowGLOWorksModal 
              trigger={
                <Button variant="outline" className="h-10 px-5 text-sm font-semibold gap-2">
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
