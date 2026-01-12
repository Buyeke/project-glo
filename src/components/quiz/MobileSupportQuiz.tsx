import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Home, Heart, Briefcase, Scale, HelpCircle, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface QuizResult {
  title: string;
  description: string;
  services: string[];
  cta: { text: string; link: string };
}

const MobileSupportQuiz = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isStarted, setIsStarted] = useState(false);

  const questions = [
    {
      question: "What type of support are you looking for?",
      options: [
        { value: "shelter", label: "Safe shelter or housing", icon: Home },
        { value: "emotional", label: "Emotional or mental health support", icon: Heart },
        { value: "employment", label: "Job opportunities or skills training", icon: Briefcase },
        { value: "legal", label: "Legal assistance", icon: Scale },
        { value: "unsure", label: "I'm not sure yet", icon: HelpCircle },
      ],
    },
    {
      question: "How urgent is your need?",
      options: [
        { value: "immediate", label: "I need help right now", icon: Heart },
        { value: "soon", label: "Within the next few days", icon: null },
        { value: "planning", label: "I'm planning ahead", icon: null },
      ],
    },
    {
      question: "Do you have children with you?",
      options: [
        { value: "yes", label: "Yes, I have children", icon: null },
        { value: "no", label: "No", icon: null },
        { value: "pregnant", label: "I am pregnant", icon: null },
      ],
    },
  ];

  const getResult = (userAnswers: string[]): QuizResult => {
    const [need, urgency] = userAnswers;
    
    if (urgency === "immediate") {
      return {
        title: "Immediate Support Available",
        description: "We understand you need help right now. Our AI assistant is available 24/7 to connect you with emergency services.",
        services: ["Emergency shelter placement", "Crisis counseling", "Immediate safety resources"],
        cta: { text: "Chat Now for Support", link: "/contact" },
      };
    }

    if (need === "shelter") {
      return {
        title: "Housing & Shelter Support",
        description: "We can help connect you with safe housing options and transitional programs in your area.",
        services: ["Emergency shelters", "Transitional housing", "Safe space network"],
        cta: { text: "Find Safe Shelter", link: "/services" },
      };
    }

    if (need === "legal") {
      return {
        title: "Legal Assistance",
        description: "Our partners can provide legal aid for various situations including domestic matters, custody, and documentation.",
        services: ["Legal aid consultation", "Document assistance", "Court accompaniment"],
        cta: { text: "Connect with Legal Help", link: "/services" },
      };
    }

    if (need === "employment") {
      return {
        title: "Employment & Skills Training",
        description: "We can connect you with job opportunities and skills training programs designed for your success.",
        services: ["Job matching", "Skills workshops", "Career counseling"],
        cta: { text: "Explore Job Opportunities", link: "/careers" },
      };
    }

    return {
      title: "Personalized Support",
      description: "Let us help you find the right resources for your situation. Our team is here to listen and guide you.",
      services: ["One-on-one consultation", "Resource navigation", "Ongoing support"],
      cta: { text: "Get Personalized Help", link: "/contact" },
    };
  };

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setResult(getResult(newAnswers));
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      setAnswers(answers.slice(0, -1));
    } else {
      setIsStarted(false);
    }
  };

  const resetQuiz = () => {
    setStep(0);
    setAnswers([]);
    setResult(null);
    setIsStarted(false);
  };

  // Start screen
  if (!isStarted) {
    return (
      <div className="bg-card rounded-2xl border border-primary/20 p-6 md:p-8">
        <div className="text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">
            Find Your Nearest Safe Space
          </h3>
          <p className="text-muted-foreground text-lg">
            Answer a few quick questions and we'll guide you to the right support.
          </p>
          <p className="text-sm text-muted-foreground font-medium">
            No judgment. No login required.
          </p>
          
          <Button 
            onClick={() => setIsStarted(true)}
            className="w-full h-14 text-lg font-semibold mt-4"
          >
            Start Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  // Result screen
  if (result) {
    return (
      <div className="bg-card rounded-2xl border border-primary/20 p-6 md:p-8">
        <div className="text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">{result.title}</h3>
          <p className="text-muted-foreground text-lg">{result.description}</p>
        </div>
        
        <div className="bg-muted/50 rounded-xl p-4 mt-6">
          <p className="font-semibold mb-3 text-foreground">Recommended services for you:</p>
          <ul className="space-y-2">
            {result.services.map((service, index) => (
              <li key={index} className="flex items-center gap-3 text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                <span className="text-base">{service}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="flex flex-col gap-3 mt-6">
          <Button asChild className="w-full h-14 text-lg font-semibold">
            <Link to={result.cta.link}>
              {result.cta.text}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" onClick={resetQuiz} className="h-12">
            Start Over
          </Button>
        </div>
      </div>
    );
  }

  // Question screen - One question at a time
  const currentQuestion = questions[step];

  return (
    <div className="bg-card rounded-2xl border border-primary/20 p-6 md:p-8">
      {/* Header with progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={handleBack}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors touch-button p-2 -ml-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <span className="text-sm font-medium text-muted-foreground">
            {step + 1} of {questions.length}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="flex gap-2">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full transition-colors ${
                index <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* Question */}
      <h3 className="text-xl md:text-2xl font-bold text-foreground mb-6">
        {currentQuestion.question}
      </h3>
      
      {/* Options - Large touch targets */}
      <div className="space-y-3">
        {currentQuestion.options.map((option) => (
          <button
            key={option.value}
            onClick={() => handleAnswer(option.value)}
            className="quiz-option-mobile w-full text-left rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all touch-button group"
          >
            {option.icon && (
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                <option.icon className="h-5 w-5 text-primary" />
              </div>
            )}
            <span className="text-foreground font-medium flex-1">{option.label}</span>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileSupportQuiz;