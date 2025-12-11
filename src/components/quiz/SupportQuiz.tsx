import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home, Heart, Briefcase, Scale, HelpCircle, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface QuizResult {
  title: string;
  description: string;
  services: string[];
  cta: { text: string; link: string };
}

const SupportQuiz = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);

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
        { value: "immediate", label: "I need help right now", icon: null },
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

  const resetQuiz = () => {
    setStep(0);
    setAnswers([]);
    setResult(null);
  };

  if (result) {
    return (
      <Card className="border-primary/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">{result.title}</CardTitle>
          <CardDescription className="text-base">{result.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="font-medium mb-3 text-foreground">Recommended services for you:</p>
            <ul className="space-y-2">
              {result.services.map((service, index) => (
                <li key={index} className="flex items-center gap-2 text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {service}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button asChild size="lg">
              <Link to={result.cta.link}>
                {result.cta.text}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" onClick={resetQuiz}>
              Start Over
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[step];

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Question {step + 1} of {questions.length}
          </span>
          <div className="flex gap-1">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-8 rounded-full ${
                  index <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
        <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {currentQuestion.options.map((option) => (
          <button
            key={option.value}
            onClick={() => handleAnswer(option.value)}
            className="w-full p-4 text-left rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all flex items-center gap-3 group"
          >
            {option.icon && (
              <option.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
            )}
            <span className="text-foreground">{option.label}</span>
            <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </CardContent>
    </Card>
  );
};

export default SupportQuiz;
