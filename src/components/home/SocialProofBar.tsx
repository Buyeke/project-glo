import { Shield, GraduationCap, Globe } from "lucide-react";

const SocialProofBar = () => {
  return (
    <section className="py-4 bg-primary/5 border-y border-primary/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <div className="flex items-center gap-2 text-sm">
            <GraduationCap className="h-4 w-4 text-primary" aria-hidden="true" />
            <span className="text-muted-foreground">OBREAL & AAU Incubator</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-border" />
          <div className="flex items-center gap-2 text-sm">
            <Globe className="h-4 w-4 text-primary" aria-hidden="true" />
            <span className="text-muted-foreground">English · Swahili · Sheng</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-border" />
          <div className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-primary" aria-hidden="true" />
            <span className="text-muted-foreground">Kenya-registered</span>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-3">
          Operated by Glomera Operations Ltd · Building coordination infrastructure for social services
        </p>
      </div>
    </section>
  );
};

export default SocialProofBar;
