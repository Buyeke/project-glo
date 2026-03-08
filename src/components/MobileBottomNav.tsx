
import { useState } from 'react';
import { Home, User, MessageCircle, Heart, Menu, X, Info, Phone, BookOpen, Briefcase, Users, Shield, FileText } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { AnimatePresence, motion } from 'framer-motion';

const moreLinks = [
  { icon: Info, label: 'About', path: '/about' },
  { icon: Phone, label: 'Contact', path: '/contact' },
  { icon: BookOpen, label: 'Resources', path: '/resources' },
  { icon: BookOpen, label: 'Blog', path: '/blog' },
  { icon: Briefcase, label: 'Careers', path: '/careers' },
  { icon: Users, label: 'Partners', path: '/partners' },
  { icon: Shield, label: 'Privacy', path: '/privacy-policy' },
  { icon: FileText, label: 'Terms', path: '/terms-of-service' },
];

export const MobileBottomNav = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!isMobile) return null;

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: MessageCircle, label: 'Services', path: '/services' },
    { icon: Heart, label: 'Donate', path: '/donate' },
    { icon: User, label: 'Dashboard', path: '/dashboard' },
  ];

  return (
    <>
      {/* Slide-up menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[55]"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-14 left-0 right-0 z-[56] bg-card border-t border-border rounded-t-2xl shadow-xl max-h-[60vh] overflow-y-auto"
            >
              <div className="p-4 grid grid-cols-3 gap-3">
                {moreLinks.map(({ icon: Icon, label, path }) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMenuOpen(false)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-colors ${
                      location.pathname === path
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom nav bar */}
      <nav className="mobile-nav flex justify-around items-center py-2 px-4">
        {navItems.map(({ icon: Icon, label, path }) => (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center space-y-1 p-2 touch-button ${
              location.pathname === path
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        ))}
        <button
          onClick={() => setMenuOpen(prev => !prev)}
          className={`flex flex-col items-center space-y-1 p-2 touch-button ${
            menuOpen ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="text-xs font-medium">More</span>
        </button>
      </nav>
    </>
  );
};
