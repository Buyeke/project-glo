import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/hooks/useAuth';
import { ThemeProvider } from 'next-themes';
import Layout from '@/components/Layout';
import { LazyComponents } from '@/utils/performanceOptimizations';
import { Suspense } from 'react';

// Import pages that need to be loaded immediately
import Auth from '@/pages/Auth';
import Home from '@/pages/Home';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Blog from '@/pages/Blog';
import Careers from '@/pages/Careers';
import Donate from '@/pages/Donate';
import NotFound from '@/pages/NotFound';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import DataProtection from '@/pages/DataProtection';
import AdminLogin from '@/pages/AdminLogin';
import AdminSetup from '@/pages/AdminSetup';

// Enhanced query client with performance optimizations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors except 408, 429
        if (error?.status >= 400 && error?.status < 500 && ![408, 429].includes(error?.status)) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: 'always',
    },
    mutations: {
      retry: 1,
    },
  },
});

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="home" element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="auth" element={<Auth />} />
                <Route path="admin-login" element={<AdminLogin />} />
                <Route path="admin-setup" element={<AdminSetup />} />
                <Route 
                  path="dashboard" 
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <LazyComponents.Dashboard />
                    </Suspense>
                  } 
                />
                <Route 
                  path="services" 
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <LazyComponents.Services />
                    </Suspense>
                  } 
                />
                <Route 
                  path="resources" 
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <LazyComponents.Resources />
                    </Suspense>
                  } 
                />
                <Route 
                  path="admin" 
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <LazyComponents.AdminPanel />
                    </Suspense>
                  } 
                />
                <Route path="contact" element={<Contact />} />
                <Route path="blog" element={<Blog />} />
                <Route path="careers" element={<Careers />} />
                <Route path="donate" element={<Donate />} />
                <Route path="privacy-policy" element={<PrivacyPolicy />} />
                <Route path="terms-of-service" element={<TermsOfService />} />
                <Route path="data-protection" element={<DataProtection />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Router>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
