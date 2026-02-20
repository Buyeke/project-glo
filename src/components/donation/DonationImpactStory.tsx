import { Card, CardContent } from "@/components/ui/card";
import { Heart, Shield, CheckCircle } from "lucide-react";

const DonationImpactStory = () => {
  return (
    <div className="space-y-6">
      {/* Impact Story */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Heart className="h-8 w-8 text-primary flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">This Month's Impact</h3>
              <p className="text-muted-foreground leading-relaxed">
                "Thanks to donors like you, 10 women accessed legal aid this month. 
                One mother shared: <em className="text-foreground">'You gave me hope when I had none.'</em> 
                Every donation makes stories like this possible."
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trust Signals */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-4 text-center">Your Donation is Secure</h3>
          
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
              <span className="text-xl font-bold text-primary">Paystack</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">SSL Encrypted</span>
            </div>
          </div>

          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-primary" />
              Contributions support platform operations
            </li>
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-primary" />
              Transparent reporting on coordination impact
            </li>
            <li className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-primary" />
              Kenya-registered social impact company
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default DonationImpactStory;
