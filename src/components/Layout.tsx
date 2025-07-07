
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';
import ChatBot from './ChatBot';
import FloatingHelpButton from './FloatingHelpButton';
import QuickExitButton from './QuickExitButton';

const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <QuickExitButton />
      <main>
        <Outlet />
      </main>
      <Footer />
      <ChatBot />
      <FloatingHelpButton />
    </div>
  );
};

export default Layout;
