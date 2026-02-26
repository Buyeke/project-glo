import { Button } from "@/components/ui/button";
import { ArrowRight, Heart } from "lucide-react";

interface QuizStartProps {
  onStart: () => void;
}

export const QuizStart = ({ onStart }: QuizStartProps) => (
  <div className="bg-card rounded-2xl border border-primary/20 p-6 md:p-8">
    <div className="text-center space-y-4">
      <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
        <Heart className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-2xl font-bold text-foreground">
        Find Your Nearest Safe Space
      </h3>
      <p className="text-muted-foreground text-lg">
        Answer a few quick questions and we'll connect you to verified support services.
      </p>
      <p className="text-sm text-muted-foreground font-medium">
        No judgment. No login required.
      </p>
      <Button onClick={onStart} className="w-full h-14 text-lg font-semibold mt-4">
        Start Now
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  </div>
);
