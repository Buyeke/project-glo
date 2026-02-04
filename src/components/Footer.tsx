import { Link } from "react-router-dom";
import { Mail, Users, Shield, Lock, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-xl font-bold mb-4 text-primary">Project GLO</h3>
            <p className="text-muted-foreground mb-4 text-sm md:text-base">
              A multilingual technology platform connecting women to verified support organizations across Kenya.
            </p>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2 mt-4">
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
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-foreground">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">About</Link></li>
              <li><Link to="/services" className="text-muted-foreground hover:text-primary transition-colors">Services</Link></li>
              <li><Link to="/resources" className="text-muted-foreground hover:text-primary transition-colors">Resources</Link></li>
              <li><Link to="/partners" className="text-muted-foreground hover:text-primary transition-colors">Partners</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-foreground">Support</h4>
            <ul className="space-y-2">
              <li><Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
              <li><Link to="/careers" className="text-muted-foreground hover:text-primary transition-colors">Careers</Link></li>
              <li><Link to="/donate" className="text-muted-foreground hover:text-primary transition-colors">Donate</Link></li>
              <li><Link to="/employer-dashboard" className="text-muted-foreground hover:text-primary transition-colors">For Employers</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-foreground">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-1 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">General Inquiries</p>
                  <p className="text-muted-foreground text-sm">info@projectglo.org</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 mt-1 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Partnerships</p>
                  <p className="text-muted-foreground text-sm">founder@projectglo.org</p>
                </div>
              </div>
            </div>
            
          </div>
        </div>
        
        {/* Security & Trust Footer */}
        <div className="border-t border-border mt-8 pt-8">
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground">
              <Shield className="h-4 w-4 inline-block mr-1" />
              Your data is secure, encrypted, and only accessible by approved support staff.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-muted-foreground text-sm text-center md:text-left">
              <p>© 2025 Glomera Operations Ltd. All rights reserved.</p>
              <p className="text-xs mt-1">Project GLO is operated by Glomera Operations Ltd, a Kenya-registered social impact technology company.</p>
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link to="/privacy-policy" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                Terms of Service
              </Link>
              <Link to="/data-protection" className="text-muted-foreground hover:text-primary text-sm transition-colors">
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
