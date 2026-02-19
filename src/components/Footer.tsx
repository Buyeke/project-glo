import { Link } from "react-router-dom";
import { Mail, Shield, Lock, ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border">
      {/* CTA Row */}
      <div className="border-b border-border py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild>
              <Link to="/partners">
                Become a Partner
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/donate">
                <Heart className="mr-2 h-4 w-4" />
                Donate
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Four-column grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Column 1: Project GLO */}
          <div>
            <h3 className="text-lg font-bold mb-3 text-primary">Project GLO</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              An AI-powered coordination platform with trauma-informed chatbot in Sheng, Swahili, and English—connecting women in Kenya to verified partner organizations.
            </p>
            <div className="flex gap-2">
              <div className="flex items-center gap-1 px-2 py-1 bg-primary/5 rounded text-xs">
                <Shield className="h-3 w-3 text-primary" />
                <span className="text-muted-foreground">Encrypted</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-primary/5 rounded text-xs">
                <Lock className="h-3 w-3 text-primary" />
                <span className="text-muted-foreground">Secure</span>
              </div>
            </div>
          </div>

          {/* Column 2: Platform */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-foreground">Platform</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-muted-foreground hover:text-primary text-sm transition-colors">Home</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-primary text-sm transition-colors">About</Link></li>
              <li><Link to="/partners" className="text-muted-foreground hover:text-primary text-sm transition-colors">Partners</Link></li>
              <li><Link to="/blog" className="text-muted-foreground hover:text-primary text-sm transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Column 3: Get Involved */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-foreground">Get Involved</h4>
            <ul className="space-y-2">
              <li><Link to="/employer-dashboard" className="text-muted-foreground hover:text-primary text-sm transition-colors">For Employers</Link></li>
              <li><Link to="/donate" className="text-muted-foreground hover:text-primary text-sm transition-colors">Donate</Link></li>
              <li><Link to="/careers" className="text-muted-foreground hover:text-primary text-sm transition-colors">Careers</Link></li>
              <li><Link to="/partners" className="text-muted-foreground hover:text-primary text-sm transition-colors">Partner With Us</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-foreground">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">General Inquiries</p>
                  <p className="text-sm text-foreground">info@projectglo.org</p>
                </div>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Partnerships</p>
                  <p className="text-sm text-foreground">founder@projectglo.org</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border mt-8 pt-6">
          {/* Bottom line: Legal + Policy links */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <p className="text-xs text-muted-foreground">
              © 2026 Glomera Operations Ltd. Project GLO is operated by Glomera Operations Ltd, a Kenya-registered social impact technology company.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/privacy-policy" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link to="/data-protection" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                Data Protection
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
