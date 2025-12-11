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
              "Last month, your donations helped 10 women access legal aid and safe shelter. 
              One mother told us, 'For the first time in years, my children and I feel safe.' 
              This is the impact of your generosity."
            </p>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                — Project GLO Impact Report, December 2024
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImpactTestimonial;
