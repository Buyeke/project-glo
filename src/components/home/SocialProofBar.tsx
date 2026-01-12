import { Shield, Clock, Lock, Users } from "lucide-react";

const SocialProofBar = () => {
  const stats = [
    { value: "200+", label: "Vulnerable Women Supported", icon: Users },
    { value: "24/7", label: "AI Guided Support", icon: Clock },
    { value: "Strictly", label: "Confidential", icon: Lock },
    { value: "Secure", label: "Encrypted Data", icon: Shield },
  ];

  return (
    <section className="py-4 md:py-6 bg-primary/5 border-y border-primary/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile: 2x2 grid, Desktop: 4 columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center text-center p-2">
              <stat.icon className="h-5 w-5 text-primary mb-1" aria-hidden="true" />
              <div className="text-lg md:text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
        
        {/* Partner Logos - Simplified on mobile */}
        <div className="mt-4 pt-4 border-t border-primary/10">
          <p className="text-center text-xs text-muted-foreground mb-3 font-medium">
            Trusted by global research institutions and incubator programs
          </p>
          <div className="flex justify-center items-center gap-3 md:gap-6 flex-wrap">
            <div className="px-2 py-1 md:px-3 md:py-1.5 bg-background rounded-lg border">
              <span className="font-semibold text-foreground text-xs md:text-sm">OBREAL</span>
              <span className="text-muted-foreground text-xs ml-1">Spain</span>
            </div>
            <div className="px-2 py-1 md:px-3 md:py-1.5 bg-background rounded-lg border">
              <span className="font-semibold text-foreground text-xs md:text-sm">OBREAL & AAU</span>
              <span className="text-muted-foreground text-xs ml-1 hidden sm:inline">Youth Incubator 2024/2025</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProofBar;
