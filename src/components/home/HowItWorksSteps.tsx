import { MessageCircle, Compass, UserCheck } from "lucide-react";

interface HowItWorksStepsProps {
  variant?: "default" | "compact";
}

const HowItWorksSteps = ({ variant = "default" }: HowItWorksStepsProps) => {
  const steps = [
    {
      number: "1",
      title: "Share what you need",
      description: "Chat or browse anonymously",
      icon: MessageCircle,
    },
    {
      number: "2",
      title: "Get matched",
      description: "To verified partner organizations",
      icon: Compass,
    },
    {
      number: "3",
      title: "Receive follow-up",
      description: "From a trained support worker",
      icon: UserCheck,
    },
  ];

  if (variant === "compact") {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-center gap-4 sm:gap-8 py-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary">{step.number}</span>
            </div>
            <span className="text-sm font-medium text-foreground">{step.title}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="py-6 md:py-8 bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="text-lg md:text-xl font-bold text-foreground text-center mb-4">
          How It Works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step, index) => (
            <div key={index} className="flex md:flex-col items-start md:items-center md:text-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <step.icon className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-primary">Step {step.number}</span>
                <h3 className="text-sm font-bold text-foreground">{step.title}</h3>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSteps;
