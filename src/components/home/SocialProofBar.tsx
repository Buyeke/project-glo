import { Users, Building } from "lucide-react";

const SocialProofBar = () => {
  return (
    <section className="py-4 bg-primary/5 border-y border-primary/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-primary" aria-hidden="true" />
            <span className="font-semibold text-foreground">200+</span>
            <span className="text-muted-foreground">women connected</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-border" />
          <div className="flex items-center gap-2 text-sm">
            <Building className="h-4 w-4 text-primary" aria-hidden="true" />
            <span className="font-semibold text-foreground">15+</span>
            <span className="text-muted-foreground">partner organizations</span>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-3">
          Operated by Glomera Operations Ltd · Incubated by OBREAL & AAU
        </p>
      </div>
    </section>
  );
};

export default SocialProofBar;
