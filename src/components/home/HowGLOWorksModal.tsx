import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle, Users, Phone, CheckCircle, ArrowRight, Shield, Play } from "lucide-react";

interface HowGLOWorksModalProps {
  trigger?: React.ReactNode;
  defaultOpen?: boolean;
}

const HowGLOWorksModal = ({ trigger, defaultOpen = false }: HowGLOWorksModalProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const steps = [
    {
      number: 1,
      title: "Chat or Explore Safely",
      description: "Browse services anonymously or chat with our AI assistant in English, Swahili, or Sheng. No login required to start.",
      icon: MessageCircle,
      details: [
        "24/7 AI-powered matching",
        "Multilingual assistance",
        "Completely anonymous browsing",
      ],
      color: "bg-blue-500",
    },
    {
      number: 2,
      title: "Get Matched to Partner Organizations",
      description: "Based on your needs, our platform matches you with independent, verified organizations that provide shelter, legal aid, counseling, and employment support.",
      icon: Users,
      details: [
        "15+ partner organizations",
        "Verified and independent providers",
        "Personalized recommendations",
      ],
      color: "bg-purple-500",
    },
    {
      number: 3,
      title: "A Partner Organization Follows Up",
      description: "Within 24 hours, a trained support worker from an independent partner organization will contact you directly.",
      icon: Phone,
      details: [
        "Human support within 24 hours",
        "Trauma-informed approach",
        "Coordinated follow-up",
      ],
      color: "bg-green-500",
    },
  ];

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Play className="h-4 w-4" />
            See How GLO Works
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold text-center">
            How GLO Works
          </DialogTitle>
          <p className="text-center text-muted-foreground">
            Three simple steps to get the support you need
          </p>
        </DialogHeader>

        <div className="p-6">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((step, index) => (
              <button
                key={step.number}
                onClick={() => setActiveStep(index)}
                className={`flex items-center gap-2 transition-all duration-300 ${
                  index === activeStep ? "scale-110" : "opacity-60 hover:opacity-80"
                }`}
              >
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 ${
                    index === activeStep ? step.color : "bg-muted-foreground/30"
                  } ${index < activeStep ? "bg-green-500" : ""}`}
                >
                  {index < activeStep ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    step.number
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-1 rounded transition-all duration-300 ${
                      index < activeStep ? "bg-green-500" : "bg-muted"
                    }`}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Active step content with animation */}
          <div className="relative min-h-[280px]">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div
                  key={step.number}
                  className={`absolute inset-0 transition-all duration-500 ${
                    index === activeStep
                      ? "opacity-100 translate-x-0"
                      : index < activeStep
                      ? "opacity-0 -translate-x-full"
                      : "opacity-0 translate-x-full"
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    {/* Icon with animated background */}
                    <div className="relative mb-6">
                      <div
                        className={`absolute inset-0 ${step.color} rounded-full blur-xl opacity-30 animate-pulse`}
                      />
                      <div
                        className={`relative h-20 w-20 rounded-full ${step.color} flex items-center justify-center animate-scale-in`}
                      >
                        <IconComponent className="h-10 w-10 text-white" />
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-foreground mb-3 animate-fade-in">
                      Step {step.number}: {step.title}
                    </h3>

                    <p className="text-muted-foreground mb-6 max-w-md animate-fade-in">
                      {step.description}
                    </p>

                    {/* Details list */}
                    <div className="space-y-2 animate-fade-in">
                      {step.details.map((detail, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                          style={{ animationDelay: `${i * 100}ms` }}
                        >
                          <div
                            className={`h-1.5 w-1.5 rounded-full ${step.color}`}
                          />
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={activeStep === 0}
              className={activeStep === 0 ? "invisible" : ""}
            >
              Previous
            </Button>

            {activeStep < steps.length - 1 ? (
              <Button onClick={handleNext} className="gap-2">
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={() => setIsOpen(false)}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Trust footer */}
          <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Your data is confidential and protected</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HowGLOWorksModal;
