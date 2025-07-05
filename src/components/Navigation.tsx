
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Resources', path: '/resources' },
    { name: 'Shop', path: '/shop' },
    { name: 'Blog', path: '/blog' },
    { name: 'Careers', path: '/careers' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="bg-background shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Heart className="h-7 w-7 text-secondary" />
            <span className="text-xl font-bold text-primary">Glo</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="text-sm text-foreground hover:text-primary transition-colors duration-200 font-medium nav-link"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-xs text-muted-foreground">
                  Welcome, {user.email}
                </span>
                <Button variant="outline" size="sm" onClick={handleSignOut} className="text-xs border-border hover:bg-muted">
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Button variant="outline" size="sm" className="text-xs border-border hover:bg-muted" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold text-xs btn-donate" asChild>
                  <Link to="/donate">Donate</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground hover:bg-muted"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-background border-t border-border">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="block px-3 py-2 text-sm text-foreground hover:text-primary hover:bg-muted/50 transition-colors rounded-md nav-link"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="px-3 py-2 space-y-2">
                {user ? (
                  <Button variant="outline" onClick={handleSignOut} className="w-full text-xs border-border hover:bg-muted" size="sm">
                    Sign Out
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" asChild className="w-full text-xs border-border hover:bg-muted" size="sm">
                      <Link to="/auth">Sign In</Link>
                    </Button>
                    <Button asChild className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold text-xs btn-donate" size="sm">
                      <Link to="/donate">Donate</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
