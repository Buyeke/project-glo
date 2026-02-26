import { Card, CardContent } from "@/components/ui/card";
import { Quote, Heart } from "lucide-react";

const ImpactTestimonial = () => {
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardContent className="p-8">
        <div className="flex items-start gap-4">
          <Quote className="h-10 w-10 text-primary/40 flex-shrink-0 rotate-180" />
          <div>
            <p className="text-lg md:text-xl text-foreground leading-relaxed italic mb-4">
              "Project GLO is building the coordination infrastructure that social services in Kenya need. 
              By connecting women to verified partner organizations through accessible, multilingual tools, 
              the platform helps ensure no one falls through the cracks."
            </p>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                — Our Mission
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImpactTestimonial;
