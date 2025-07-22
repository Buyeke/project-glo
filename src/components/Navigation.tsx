import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { siteConfig } from '@/config/site';
import { Icons } from '@/components/icons';
import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface MainNavItem {
  title: string;
  href: string;
  disabled?: boolean;
}

interface Props extends React.HTMLAttributes<HTMLElement> {
  mainNavItems?: MainNavItem[];
}

const Navigation = ({ mainNavItems }: Props) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <header className="bg-background sticky top-0 z-50 w-full border-b">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <Link to="/" className="flex items-center space-x-2">
          <Icons.logo className="h-6 w-6" />
          <span className="hidden font-bold sm:inline-block">{siteConfig.name}</span>
        </Link>
        <nav className="flex flex-1 items-center justify-end space-x-4">
          <ul className="flex gap-6 items-center">
            {mainNavItems?.length ? (
              mainNavItems.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.href}
                    className="text-sm font-medium transition-colors hover:text-foreground sm:text-sm"
                  >
                    {item.title}
                  </Link>
                </li>
              ))
            ) : null}
            <li className="hidden lg:block">
              <Link
                to="/resources"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Resources"
              >
                Resources
              </Link>
            </li>
            <li className="hidden lg:block">
              <Link
                to="/services"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Services"
              >
                Services
              </Link>
            </li>
            <li className="hidden lg:block">
              <Link
                to="/blog"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Blog"
              >
                Blog
              </Link>
            </li>
            <li className="hidden lg:block">
              <Link
                to="/contact"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Contact"
              >
                Contact
              </Link>
            </li>
            <li className="hidden lg:block">
              <Link 
                to="/admin-login" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Admin Login"
              >
                Admin
              </Link>
            </li>
          </ul>
          <div className="flex items-center space-x-2">
            <ModeToggle />
            <Button asChild size="sm" variant="ghost">
              <Link to="/auth">
                Sign In
              </Link>
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navigation;
