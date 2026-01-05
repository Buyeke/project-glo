import { Shield, Clock, Lock, Users } from "lucide-react";

const SocialProofBar = () => {
  const stats = [
    { value: "200+", label: "Vulnerable Women Supported", icon: Users },
    { value: "24/7", label: "AI Guided Support", icon: Clock },
    { value: "Strictly", label: "Confidential", icon: Lock },
    { value: "Secure", label: "Encrypted Data", icon: Shield },
  ];

  return (
    <section className="py-8 bg-primary/5 border-y border-primary/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <stat.icon className="h-6 w-6 text-primary mb-2" />
              <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
        
        {/* Partner Logos */}
        <div className="mt-8 pt-6 border-t border-primary/10">
          <p className="text-center text-sm text-muted-foreground mb-4">Trusted by global research institutions and incubator programs</p>
          <div className="flex justify-center items-center gap-8 flex-wrap">
            <div className="px-4 py-2 bg-background rounded-lg border">
              <span className="font-semibold text-foreground">OBREAL</span>
              <span className="text-muted-foreground text-sm ml-1">Spain</span>
            </div>
            <div className="px-4 py-2 bg-background rounded-lg border">
              <span className="font-semibold text-foreground">OBREAL & AAU</span>
              <span className="text-muted-foreground text-sm ml-1">Youth Incubator 2024/2025</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProofBar;
