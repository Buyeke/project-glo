import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Heart, CheckCircle, Phone, Mail, MapPin, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useServiceMatching, MatchingResult } from "@/hooks/useServiceMatching";
import { QuizQuestions } from "@/components/quiz/QuizQuestions";
import { QuizStart } from "@/components/quiz/QuizStart";
import { QuizResults } from "@/components/quiz/QuizResults";

const MobileSupportQuiz = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<MatchingResult | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const { matchByNeeds } = useServiceMatching();

  const questions = [
    {
      question: "What type of support are you looking for?",
      options: [
        { value: "shelter", label: "Safe shelter or housing" },
        { value: "emotional", label: "Emotional or mental health support" },
        { value: "employment", label: "Job opportunities or skills training" },
        { value: "legal", label: "Legal assistance" },
        { value: "unsure", label: "I'm not sure yet" },
      ],
    },
    {
      question: "How urgent is your need?",
      options: [
        { value: "immediate", label: "I need help right now" },
        { value: "soon", label: "Within the next few days" },
        { value: "planning", label: "I'm planning ahead" },
      ],
    },
    {
      question: "Do you have children with you?",
      options: [
        { value: "yes", label: "Yes, I have children" },
        { value: "no", label: "No" },
        { value: "pregnant", label: "I am pregnant" },
      ],
    },
  ];

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // Run matching with real data
      const [need, urgency] = newAnswers;
      const matchResult = matchByNeeds([need], urgency as any);
      setResult(matchResult);
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

  if (!isStarted) {
    return <QuizStart onStart={() => setIsStarted(true)} />;
  }

  if (result) {
    return <QuizResults result={result} onReset={resetQuiz} />;
  }

  return (
    <QuizQuestions
      questions={questions}
      step={step}
      onAnswer={handleAnswer}
      onBack={handleBack}
    />
  );
};

export default MobileSupportQuiz;
