
import { Home, User, MessageCircle, Heart, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useMobileDetection } from '@/hooks/useMobileDetection';

export const MobileBottomNav = () => {
  const location = useLocation();
  const { isNativeApp } = useMobileDetection();

  if (!isNativeApp) return null;

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: MessageCircle, label: 'Services', path: '/services' },
    { icon: Heart, label: 'Donate', path: '/donate' },
    { icon: User, label: 'Dashboard', path: '/dashboard' },
    { icon: Menu, label: 'More', path: '/about' }
  ];

  return (
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
    </nav>
  );
};
