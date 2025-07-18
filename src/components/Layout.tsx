
import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';
import FloatingHelpButton from './FloatingHelpButton';
import QuickExitButton from './QuickExitButton';
import { LazyComponents } from '@/utils/performanceOptimizations';

const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <QuickExitButton />
      <main>
        <Outlet />
      </main>
      <Footer />
      
      {/* Lazy load ChatBot to improve initial page load */}
      <Suspense fallback={null}>
        <LazyComponents.ChatBot />
      </Suspense>
      
      <FloatingHelpButton />
    </div>
  );
};

export default Layout;
