import { ArrowLeft, ArrowRight } from "lucide-react";

interface QuizQuestion {
  question: string;
  options: Array<{ value: string; label: string }>;
}

interface QuizQuestionsProps {
  questions: QuizQuestion[];
  step: number;
  onAnswer: (answer: string) => void;
  onBack: () => void;
}

export const QuizQuestions = ({ questions, step, onAnswer, onBack }: QuizQuestionsProps) => {
  const currentQuestion = questions[step];

  return (
    <div className="bg-card rounded-2xl border border-primary/20 p-6 md:p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors p-2 -ml-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <span className="text-sm font-medium text-muted-foreground">
            {step + 1} of {questions.length}
          </span>
        </div>
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

      <h3 className="text-xl md:text-2xl font-bold text-foreground mb-6">
        {currentQuestion.question}
      </h3>

      <div className="space-y-3">
        {currentQuestion.options.map((option) => (
          <button
            key={option.value}
            onClick={() => onAnswer(option.value)}
            className="quiz-option-mobile w-full text-left rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all p-4 group flex items-center justify-between"
          >
            <span className="text-foreground font-medium">{option.label}</span>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};
