
import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';
import FloatingHelpButton from './FloatingHelpButton';
import QuickExitButton from './QuickExitButton';
import { MobileBottomNav } from './MobileBottomNav';
import { LazyComponents } from '@/utils/performanceOptimizations';
import { useSessionTracking } from '@/hooks/useDataTracking';
import ErrorBoundary from './ErrorBoundary';
import SEOHead from './SEOHead';
import JsonLd from './JsonLd';
import CookieConsent from './CookieConsent';
import PageTransition from './PageTransition';

const Layout = () => {
  useSessionTracking();
  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      <SEOHead />
      <JsonLd />
      <Navigation />
      <QuickExitButton />
      <main>
        <ErrorBoundary section="page content">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </ErrorBoundary>
      </main>
      <Footer />
      
      {/* Lazy load ChatBot to improve initial page load */}
      <ErrorBoundary section="chat">
        <Suspense fallback={null}>
          <LazyComponents.ChatBot />
        </Suspense>
      </ErrorBoundary>
      
      <FloatingHelpButton />
      <MobileBottomNav />
      <CookieConsent />
    </div>
  );
};

export default Layout;
