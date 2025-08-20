
import { Link } from "react-router-dom";
import { Mail, Users } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-foreground">Project GLO</h3>
            <p className="text-muted-foreground mb-4">
              Empowering communities through AI-driven support and resource matching.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-foreground">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
              <li><Link to="/services" className="text-muted-foreground hover:text-foreground transition-colors">Services</Link></li>
              <li><Link to="/resources" className="text-muted-foreground hover:text-foreground transition-colors">Resources</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-foreground">Support</h4>
            <ul className="space-y-2">
              <li><Link to="/help" className="text-muted-foreground hover:text-foreground transition-colors">Help Center</Link></li>
              <li><Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
              <li><Link to="/careers" className="text-muted-foreground hover:text-foreground transition-colors">Careers</Link></li>
              <li><Link to="/donate" className="text-muted-foreground hover:text-foreground transition-colors">Donate</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-foreground">Contact Information</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-1 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">General Inquiries</p>
                  <p className="text-muted-foreground text-sm">info@projectglo.org</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 mt-1 text-accent" />
                <div>
                  <p className="text-sm font-medium text-foreground">Partnerships & Grants</p>
                  <p className="text-muted-foreground text-sm">founder@projectglo.org</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © 2024 Project GLO. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link to="/privacy-policy" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                Terms of Service
              </Link>
              <Link to="/data-protection" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
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
